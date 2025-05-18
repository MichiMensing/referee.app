import { breakTextIntoLines, PDFDocument, PDFFont, PDFPage, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import Question from "./Question";
import Quiz from "./Quiz";

const marginLR = 60;
const marginTB = 50;
const lineSpacing = 10;
const lineHeight = 14;
const fontSize = 12;
const headerSize = 80;

type TTextOptions = {
  width: number,
  height: number,
  fontRegular?: PDFFont,
  fontBold?: PDFFont,
  maxWidth: number
}

type TTestData = { [id: string]: Question };

export default class PDFGenerator {

  private _textOptions: TTextOptions = {
    width: 590,
    height: 840,
    maxWidth: 590
  };

  private _currentPage?: PDFPage;

  private _doc?: PDFDocument;

  private _cursor: number = 0;

  private _language: string = "en";

  constructor(lang:string) {
    this._language = lang || "en";
  }

  public async createQuizPDF(quiz?: Quiz, data?: {[id:string]: Question}) {
    if (!quiz || !data) return "";
    this._doc = await PDFDocument.create();
    this._currentPage = this._doc.addPage();
    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer())

    this._doc.registerFontkit(fontkit);

    const fontRegular = await this._doc.embedFont(fontBytes, {subset: true});
    const fontBold = await this._doc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = this._currentPage.getSize();

    this._textOptions = {
      width,
      height,
      fontRegular,
      fontBold,
      maxWidth: width - 2 * marginLR
    }
    this.setMetadata();
    this.createHeader(quiz.name);


    this.generateAllQuestions(quiz, data);

    this._doc.getForm().flatten();

    const pdfDataUri = await this._doc.saveAsBase64({ dataUri: true });
    return pdfDataUri;
  }

  private createHeader(name:string) {
    if (!this._currentPage) return;
    const { width, height } = this._textOptions;
    this._currentPage.drawText('Beach Handball Rules Test', { x: marginLR, y: height - marginTB - 20, size: 20, maxWidth: width - marginLR });
    this._currentPage.drawText(`Quiz Name: ${name}`, {
      x: marginLR, y: height - marginTB - 20 - lineSpacing - fontSize, size: fontSize, maxWidth: width - 2 * marginLR - 150,
      lineHeight: lineHeight
    });
    this._currentPage.drawText('Name:', { x: width - marginLR - 140, y: height - marginTB - 20 - lineSpacing - fontSize, size: fontSize, maxWidth: width - marginLR });
    this._currentPage.drawLine({
      start: { x: width - marginLR - 100, y: height - marginTB - 20 - lineSpacing - fontSize },
      end: { x: width - marginLR, y: height - marginTB - 20 - lineSpacing - fontSize },
      thickness: 1
    });
  }

  private setMetadata() {
    if (!this._doc) return;
    this._doc.setTitle('Beach Handball Rules Test');
    this._doc.setAuthor('US Beach Handball Tour');
    this._doc.setProducer('US Beach Handball Tour Referee Quiz');
    this._doc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)');
    this._doc.setCreationDate(new Date());
    this._doc.setModificationDate(new Date());
  }

  private generateAllQuestions(quiz: Quiz, data: TTestData ) {
    let questions: Question[] = [];
    if (quiz.questions.length > 0) {
      quiz.questions.forEach((qId) => questions.push(data[qId]));
    } else {
      questions = Object.values(data);
    }
    const maxQuestions = quiz.maxQuestions === 0 ? questions.length : Math.min(quiz.maxQuestions,questions.length);

    let selectedQuestions = [];
    let selectedNumbers: number[] = [];
    while (selectedQuestions.length < maxQuestions) {
      const randomNumber = Math.floor(Math.random() * questions.length);
      if (!selectedNumbers.includes(randomNumber)) {
        selectedNumbers.push(randomNumber);
        selectedQuestions.push(questions[randomNumber]);
      }
    }

    this._cursor = this._textOptions.height - marginTB - headerSize;
    selectedQuestions.forEach((q, i) => {
      this.generateQuestion(i,q);
      this._cursor = this._cursor - 30;
    });
  }

  private generateQuestion(index: number, question: Question) {
    const headerText = [
      `Question ${index + 1})`,
      question.question[this._language]
    ].join("\n");
    const options = question.answers[this._language];
    const amountOfAnswers = Object.keys(options).length;
    const optionsText = Object.values(options).join("\n");
    const questionHeight = this.wordWrapHeight(headerText, this._textOptions.maxWidth, this._textOptions.fontRegular)
      + this.wordWrapHeight(optionsText, this._textOptions.maxWidth - 30, this._textOptions.fontRegular)
      + amountOfAnswers * lineSpacing;

    this.movePageIfNecessary(questionHeight);

    this.addText(`Question ${index + 1})`, undefined, true);
    this.addText(question.question[this._language]);
    Object.values(options).forEach((optionsText, i) => {
      this._cursor = this._cursor - lineSpacing;
      this.generateQuestionOption(index, i, optionsText);
    });
  }

  private generateQuestionOption(qIndex: number, oIndex: number, text: string) {
    if (!this._doc || !this._currentPage) return;
    const form = this._doc.getForm();
    const checkbox = form.createCheckBox(`question${qIndex}.${String.fromCharCode(97 + oIndex)}`);

    checkbox.addToPage(this._currentPage, {
      x: marginLR,
      y: this._cursor,
      width: 10,
      height: 10
    });
    this.addText(`${String.fromCharCode(97 + oIndex)})`, 15, false, true);
    this.addText(text, 30);
  }

  private addText(text: string, offsetX: number = 0, isBold: boolean = false, skipCursorUpdate: boolean = false) {
    if (!this._currentPage || !this._textOptions.fontRegular || !this._textOptions.fontBold) return;
    const { fontRegular, fontBold, maxWidth } = this._textOptions;
    const font = isBold ? fontBold : fontRegular;
    const textHeight = this.wordWrapHeight(text, maxWidth - (offsetX | 0), font);
    this._currentPage.drawText(text, {
      x: marginLR + (offsetX | 0),
      y: this._cursor,
      font: font,
      size: fontSize,
      maxWidth: maxWidth - (offsetX | 0),
      lineHeight: lineHeight,

    });
    if (!skipCursorUpdate) {
      this._cursor = this._cursor - textHeight;
    }
  }

  private wordWrapHeight(text: string, maxWidth?: number, font?: PDFFont) {
    if (!font || !this._textOptions.fontRegular) return 0;
    const testFont = this._textOptions.fontRegular;
    const getTextWidth = (t: string) => testFont.widthOfTextAtSize(t, fontSize);
    const lines = breakTextIntoLines(text, [" "], maxWidth || this._textOptions.maxWidth, getTextWidth);
    return lines.length * lineHeight;
  }

  private movePageIfNecessary(spaceNeeded: number) {
    if (!this._doc || this._cursor - spaceNeeded >= marginTB) {
      return;
    }

    this._currentPage = this._doc.addPage();
    this._cursor = this._currentPage.getHeight() - marginTB;
  }

}
