import { breakTextIntoLines, PDFDocument, PDFFont, PDFPage, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import Question from "./Question";
import Quiz from "./Quiz";
import { TFunctionNonStrict } from 'i18next';

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

  private _fnTrans: TFunctionNonStrict<"translation", undefined>;

  constructor(lang: string, translation: TFunctionNonStrict<"translation", undefined>) {
    this._language = lang || "en";
    this._fnTrans = translation;
  }

  public async createQuizPDF(quiz?: Quiz, data?: { [id: string]: Question }) {
    if (!quiz || !data) return "";
    this._doc = await PDFDocument.create();
    this._currentPage = this._doc.addPage();
    const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer())

    this._doc.registerFontkit(fontkit);

    const fontRegular = await this._doc.embedFont(fontBytes, { subset: true });
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

  private createHeader(name: string) {
    if (!this._currentPage) return;
    const { width, height } = this._textOptions;
    this._currentPage.drawText(this._fnTrans('quizzes.pdf.title'), { x: marginLR, y: height - marginTB - 20, size: 20, maxWidth: width - marginLR });
    this._currentPage.drawText(`${this._fnTrans('quizzes.pdf.quiz-name')}: ${name}`, {
      x: marginLR, y: height - marginTB - 20 - lineSpacing - fontSize, size: fontSize, maxWidth: width - 2 * marginLR - 150,
      lineHeight: lineHeight
    });
    this._currentPage.drawText(`${this._fnTrans('quizzes.settings.name')}:`, { x: width - marginLR - 140, y: height - marginTB - 20 - lineSpacing - fontSize, size: fontSize, maxWidth: width - marginLR });
    this._currentPage.drawLine({
      start: { x: width - marginLR - 100, y: height - marginTB - 20 - lineSpacing - fontSize },
      end: { x: width - marginLR, y: height - marginTB - 20 - lineSpacing - fontSize },
      thickness: 1
    });
  }

  private createFooter() {
    const numberPages = this._doc?.getPages().length;
    const { fontRegular, width } = this._textOptions;
    this._doc?.getPages().forEach((page, i) => {
      const pageNumberText = `${i + 1}/${numberPages}`;
      const textWidth = fontRegular?.widthOfTextAtSize(pageNumberText, fontSize) || 0;
      page.drawText(pageNumberText, {
        x: (width / 2) - (textWidth / 2),
        y: marginTB - 12,
        font: fontRegular,
        size: fontSize - 4,
        lineHeight: lineHeight - 4,
      });
    })
  }

  private setMetadata() {
    if (!this._doc) return;
    this._doc.setTitle(this._fnTrans('quizzes.pdf.title'));
    this._doc.setAuthor('US Beach Handball Tour');
    this._doc.setProducer('US Beach Handball Tour Referee Quiz');
    this._doc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)');
    this._doc.setCreationDate(new Date());
    this._doc.setModificationDate(new Date());
  }

  private generateAllQuestions(quiz: Quiz, data: TTestData) {
    let questions: Question[] = [];
    if (quiz.questions.length > 0) {
      quiz.questions.forEach((qId) => questions.push(data[qId]));
    } else {
      questions = Object.values(data);
    }
    const maxQuestions = quiz.maxQuestions === 0 ? questions.length : Math.min(quiz.maxQuestions, questions.length);

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
      this.generateQuestion(i, q);
      this._cursor = this._cursor - 20;
    });


    this.createFooter();

    this.generateAnswerSheet(selectedQuestions);
  }

  private generateQuestion(index: number, question: Question) {
    const headerText = [
      `${this._fnTrans('rulestest.question')} ${index + 1})`,
      question.question[this._language]
    ].join("\n");
    const options = question.answers[this._language];
    const amountOfAnswers = Object.keys(options).length;
    const optionsText = Object.values(options).join("\n");
    const questionHeight = this.wordWrapHeight(headerText, this._textOptions.maxWidth, this._textOptions.fontRegular)
      + this.wordWrapHeight(optionsText, this._textOptions.maxWidth - 30, this._textOptions.fontRegular)
      + amountOfAnswers * lineSpacing;

    this.movePageIfNecessary(questionHeight);

    this.addText(`${this._fnTrans('rulestest.question')} ${index + 1})`, undefined, true);
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

  private generateAnswerSheet(questions: Question[]) {
    if (!this._doc) return;
    this._currentPage = this._doc.addPage();
    const { height, width } = this._textOptions;
    this._currentPage.drawText(
      this._fnTrans('quizzes.pdf.answer_title'), {
      x: marginLR,
      y: height - marginTB - 20,
      size: 20,
      maxWidth: width - marginLR
    });
    this._cursor = height - marginTB - headerSize;

    let tableTop = height - marginTB - headerSize + 15;
    this._currentPage.drawLine({
      start: { x: marginLR, y: tableTop },
      end: { x: width - marginLR, y: tableTop },
      thickness: 1
    });
    this.addText(`${this._fnTrans('rulestest.question')}`, 5, true, true);
    this.addText(`${this._fnTrans('quizzes.pdf.answers')}`, 90, true, true);
    this.addText(`${this._fnTrans('quizzes.rules')}`, 170, true);
    questions.forEach((question, i) => {
      this.movePageIfNecessary(15, () => {
        this.drawTable(tableTop, this._cursor + 7);
      }, () => {
        tableTop = this._cursor + 10;
      });
      this._cursor = this._cursor -3
      this._currentPage?.drawLine({
        start: { x: marginLR, y: this._cursor + 13 },
        end: { x: width -marginLR, y: this._cursor + 13 },
        thickness: 1
      });
      const correctOptions = question.correct.join(", ");
      this.addText(`${this._fnTrans('rulestest.question')} ${i + 1})`, 5, false, true);
      this.addText(`${correctOptions}`, 90, false, true);
      this.addText(`${question.rules.join(", ")}`, 170);
    });
    this.drawTable(tableTop, this._cursor + 7);
  }

  private drawTable(top: number, bottom:number) {
    if (!this._currentPage) return;
    const { width } = this._textOptions;
    this._currentPage.drawLine({
      start: { x: marginLR, y: bottom},
      end: { x: width - marginLR, y: bottom},
      thickness: 1
    });

    // vertical lines
    this._currentPage.drawLine({
      start: { x: marginLR, y: top },
      end: { x: marginLR, y: bottom},
      thickness: 1
    });
    this._currentPage.drawLine({
      start: { x: marginLR + 85, y: top },
      end: { x: marginLR + 85, y: bottom},
      thickness: 1
    });
    this._currentPage.drawLine({
      start: { x: marginLR + 165, y: top },
      end: { x: marginLR + 165, y: bottom},
      thickness: 1
    });
    this._currentPage.drawLine({
      start: { x: width - marginLR, y: top },
      end: { x: width - marginLR, y: bottom},
      thickness: 1
    });

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

  private movePageIfNecessary(spaceNeeded: number, fnPreMove?: () => void, fnPostMove?: () => void) {
    if (!this._doc || this._cursor - spaceNeeded >= marginTB) {
      return;
    }
    if (fnPreMove) fnPreMove();
    this._currentPage = this._doc.addPage();
    this._cursor = this._currentPage.getHeight() - marginTB;
    if (fnPostMove) fnPostMove();
  }

}
