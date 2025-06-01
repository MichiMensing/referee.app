import {
  breakTextIntoLines, PDFDocument, PDFFont, PDFPage, StandardFonts,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { TFunctionNonStrict } from "i18next";
import Question from "./Question";
import Quiz from "./Quiz";
import QuizRun from "./QuizRun";

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
  maxWidth: number,
  size: number
}

type TTestData = { [id: string]: Question };

enum TTextAlign {
  Left,
  Center,
  Right
}

export default class PDFGenerator {
  private textOptions: TTextOptions = {
    width: 590,
    height: 840,
    maxWidth: 590,
    size: fontSize,
  };

  private currentPage?: PDFPage;

  private doc?: PDFDocument;

  private cursor: number = 0;

  private language: string = "en";

  private fnTrans?: TFunctionNonStrict<"translation", undefined>;

  constructor(lang: string, translation: TFunctionNonStrict<"translation", undefined>) {
    this.language = lang || "en";
    this.fnTrans = translation;
  }

  public async createQuizPDF(quiz?: Quiz, data?: TTestData) {
    if (!quiz || !data) return { quiz: "", answers: "" };
    await this.setupNewDocument(this.t("quizzes.pdf.test-title"));
    if (!this.doc) return { quiz: "", answers: "" };
    this.createTestHeader(quiz.name);

    let questions: Question[] = [];
    if (quiz.questions.length > 0) {
      quiz.questions.forEach((qId) => questions.push(data[qId]));
    } else {
      questions = Object.values(data);
    }
    const maxQuestions = quiz.maxQuestions === 0
      ? questions.length : Math.min(quiz.maxQuestions, questions.length);

    const selectedQuestions = [];
    const selectedNumbers: number[] = [];
    while (selectedQuestions.length < maxQuestions) {
      const randomNumber = Math.floor(Math.random() * questions.length);
      if (!selectedNumbers.includes(randomNumber)) {
        selectedNumbers.push(randomNumber);
        selectedQuestions.push(questions[randomNumber]);
      }
    }

    this.generateAllQuestions(selectedQuestions);

    this.createFooter();
    this.doc.getForm().flatten();
    const pdfQuizUri = await this.doc.saveAsBase64({ dataUri: true });

    await this.setupNewDocument(this.t("quizzes.pdf.answer-title"));
    this.generateAnswerSheet(selectedQuestions);
    const pdfAnswersUri = await this.doc.saveAsBase64({ dataUri: true });

    return { quiz: pdfQuizUri, answers: pdfAnswersUri };
  }

  public async createResultPDF(quiz?: Quiz, run?: QuizRun, data?: TTestData) {
    if (!quiz || !run || !data) return "";
    await this.setupNewDocument(this.t("quizzes.pdf.result-title"));
    if (!this.doc) return "";
    this.createResultHeader(quiz.name, run);
    this.createSettings(quiz);

    const selectedQuestions: Question[] = [];
    if (run.answers) {
      Object.keys(run.answers).forEach((qId) => selectedQuestions.push(data[qId]));
    }

    this.generateAllQuestions(selectedQuestions, this.cursor, run);

    if (Object.keys(run.answers || {}).length < run.total) {
      this.addText(this.t("quizzes.pdf.quiz-incomplete"), undefined, false, TTextAlign.Center);
    }

    this.createFooter();
    this.doc.getForm().flatten();
    const pdfResultUri = await this.doc.saveAsBase64({ dataUri: true });

    return pdfResultUri;
  }

  private async setupNewDocument(title: string) {
    this.doc = await PDFDocument.create();
    this.currentPage = this.doc.addPage();
    const url = "https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf";
    const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

    this.doc.registerFontkit(fontkit);

    const fontRegular = await this.doc.embedFont(fontBytes, { subset: true });
    const fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = this.currentPage.getSize();

    this.textOptions = {
      width,
      height,
      fontRegular,
      fontBold,
      maxWidth: width - 2 * marginLR,
      size: fontSize,
    };
    this.setMetadata(title);
  }

  private createTestHeader(name: string) {
    if (!this.currentPage) return;
    const { width, height } = this.textOptions;
    this.cursor = height - marginTB - 20;
    this.addText(this.t("quizzes.pdf.test-title"), { ...this.textOptions, size: 20 });
    this.cursor = height - marginTB - 20 - lineSpacing - fontSize;
    this.addText(`${this.t("quizzes.pdf.quiz-name")}: ${name}`, { ...this.textOptions, maxWidth: width - 2 * marginLR - 150 }, true);
    this.addText(`${this.t("quizzes.settings.name")}:`, undefined, false, TTextAlign.Right, 105);
    this.currentPage.drawLine({
      start: { x: width - marginLR - 100, y: height - marginTB - 20 - lineSpacing - fontSize },
      end: { x: width - marginLR, y: height - marginTB - 20 - lineSpacing - fontSize },
      thickness: 1,
    });
  }

  private createResultHeader(name: string, run: QuizRun) {
    if (!this.currentPage) return;
    const { width, height } = this.textOptions;
    this.cursor = height - marginTB - 20;
    this.addText(this.t("quizzes.pdf.result-title"), { ...this.textOptions, size: 20 });
    this.cursor = height - marginTB - 20 - lineSpacing - fontSize;
    this.addText(`${this.t("quizzes.pdf.quiz-name")}: ${name}`, { ...this.textOptions, maxWidth: width - 2 * marginLR - 150 }, true);
    this.addText(`${this.t("quizzes.pdf.score")}: ${run.correct.length} / ${run.total}`, undefined, false, TTextAlign.Right, 0, true);
    this.addText(`${this.t("quizzes.pdf.date")}: ${run.timestamp.toLocaleString()}`, undefined, true);
    this.addText(`(${(Math.round((run.correct.length / run.total) * 100 * 100) / 100).toFixed(2)}%)`, undefined, false, TTextAlign.Right);
  }

  private createSettings(quiz: Quiz) {
    if (!this.currentPage) return;
    this.cursor -= lineSpacing * 2;
    const { width } = this.textOptions;
    const tableTop = this.cursor + 20;
    this.addText(`${this.t("quizzes.settings.title")}`, undefined, false, TTextAlign.Left, 5, true);
    this.addText(
      `${this.t("quizzes.settings.questions")}: ${quiz.getQuestionSummary()}`,
      { ...this.textOptions, maxWidth: width - marginLR - marginLR - 10 },
      false,
      TTextAlign.Left,
      5,
    );
    const timeLimit = quiz.settings.timeLimit === 0 ? this.t("quizzes.settings.none") : `${quiz.settings.timeLimit} ${this.t("quizzes.settings.min")}`;
    const settingsString = [
      `${this.t("quizzes.settings.max-question")}: ${quiz.settings.maxQuestions}`,
      `${this.t("quizzes.settings.time-limit")}: ${timeLimit}`,
      `${this.t("quizzes.settings.instant-feedback")}: ${this.t(quiz.settings.instantFeedback ? "yes" : "no")}`,
    ].join(", ");
    this.addText(
      settingsString,
      { ...this.textOptions, maxWidth: width - marginLR - marginLR - 10 },
      false,
      TTextAlign.Left,
      5,
    );

    const tableBottom = this.cursor + 5;
    this.drawBox(marginLR, width - marginLR, tableTop, tableBottom);
    this.cursor -= 15;
  }

  private createFooter() {
    const numberPages = this.doc?.getPages().length;
    const { fontRegular, width } = this.textOptions;
    this.doc?.getPages().forEach((page, i) => {
      const pageNumberText = `${i + 1}/${numberPages}`;
      const textWidth = fontRegular?.widthOfTextAtSize(pageNumberText, fontSize) || 0;
      page.drawText(pageNumberText, {
        x: (width / 2) - (textWidth / 2),
        y: marginTB - 12,
        font: fontRegular,
        size: fontSize - 4,
        lineHeight: lineHeight - 4,
      });
    });
  }

  private setMetadata(title: string) {
    if (!this.doc) return;
    this.doc.setTitle(title);
    this.doc.setAuthor("US Beach Handball Tour");
    this.doc.setProducer("US Beach Handball Tour");
    this.doc.setCreator("pdf-lib (https://github.com/Hopding/pdf-lib)");
    this.doc.setCreationDate(new Date());
    this.doc.setModificationDate(new Date());
  }

  private generateAllQuestions(questions: Question[], curser?: number, run?: QuizRun) {
    this.cursor = curser || this.textOptions.height - marginTB - headerSize;
    questions.forEach((q, i) => {
      this.generateQuestion(i, q, run?.answers && run.answers[q.id]);
      this.cursor -= 20;
    });
  }

  private generateQuestion(index: number, question: Question, answers?: string[]) {
    const headerText = [
      `${this.t("rulestest.question")} ${index + 1})`,
      question.question[this.language],
    ].join("\n");
    const options = question.answers[this.language];
    const amountOfAnswers = Object.keys(options).length;
    const optionsText = Object.values(options).join("\n");
    const questionHeight = this.wordWrapHeight(
      headerText,
      this.textOptions.maxWidth,
      this.textOptions.fontRegular,
    )
      + this.wordWrapHeight(
        optionsText,
        this.textOptions.maxWidth - 30,
        this.textOptions.fontRegular,
      )
      + amountOfAnswers * lineSpacing;

    this.movePageIfNecessary(questionHeight);

    this.addText(`${this.t("rulestest.question")} ${index + 1})`, undefined, !!answers, TTextAlign.Left, 0, true);
    const { answeredCorrect, correct, rules } = question.checkAnswer(answers || []);
    if (answers) {
      this.addText(`${answeredCorrect ? 1 : 0} / 1`, undefined, false, TTextAlign.Right, 0, true);
    }
    this.addText(question.question[this.language]);
    Object.keys(options).forEach((optionChar, i) => {
      this.cursor -= lineSpacing;
      this.generateQuestionOption(
        index,
        i,
        options[optionChar],
        !!answers && correct.indexOf(optionChar) >= 0,
        !!answers && answers.indexOf(optionChar) >= 0,
      );
    });
    if (answers) {
      this.cursor -= 5;
      this.addText(
        `${this.t("rulestest.relevant-rules")}: ${rules.join(", ")}`,
        { ...this.textOptions, size: 10 },
      );
    }
  }

  private generateQuestionOption(
    qIndex: number,
    oIndex: number,
    text: string,
    correct: boolean = false,
    selected: boolean = false,
  ) {
    if (!this.doc || !this.currentPage) return;
    const { width } = this.textOptions;
    const form = this.doc.getForm();
    const checkbox = form.createCheckBox(`question${qIndex}.${String.fromCharCode(97 + oIndex)}`);

    checkbox.addToPage(this.currentPage, {
      x: marginLR,
      y: this.cursor,
      width: 10,
      height: 10,
    });
    if (selected) {
      checkbox.check();
    }
    const boxTop = this.cursor + lineHeight;
    this.addText(`${String.fromCharCode(97 + oIndex)})`, undefined, true, TTextAlign.Left, 15, correct);
    this.addText(text, undefined, false, TTextAlign.Left, 30, correct);
    const boxBottom = this.cursor + lineHeight - 4;
    if (correct) {
      this.drawBox(marginLR + 14, width - marginLR, boxTop, boxBottom);
    }
  }

  private generateAnswerSheet(questions: Question[]) {
    if (!this.doc || !this.currentPage) return;
    const { height, width } = this.textOptions;
    this.currentPage.drawText(this.t("quizzes.pdf.answer-title"), {
      x: marginLR,
      y: height - marginTB - 20,
      size: 20,
      maxWidth: width - marginLR,
    });
    this.cursor = height - marginTB - headerSize;

    let tableTop = height - marginTB - headerSize + 15;
    this.addText(`${this.t("rulestest.question")}`, undefined, true, TTextAlign.Left, 5, true);
    this.addText(`${this.t("quizzes.pdf.answers")}`, undefined, true, TTextAlign.Left, 90, true);
    this.addText(`${this.t("quizzes.rules")}`, undefined, false, TTextAlign.Left, 170, true);
    questions.forEach((question, i) => {
      this.movePageIfNecessary(15, () => {
        this.drawTable(tableTop, this.cursor + 7);
      }, () => {
        tableTop = this.cursor + 10;
      });
      this.cursor -= 3;
      const correctOptions = question.correct.join(", ");
      this.addText(`${this.t("rulestest.question")} ${i + 1})`, undefined, true, TTextAlign.Left, 5);
      this.addText(`${correctOptions}`, undefined, true, TTextAlign.Left, 90);
      this.addText(`${question.rules.join(", ")}`, undefined, false, TTextAlign.Left, 170);
    });
    this.drawTable(tableTop, this.cursor + 7);
  }

  private drawTable(top: number, bottom: number) {
    if (!this.currentPage) return;
    const { width } = this.textOptions;
    this.drawBox(marginLR, width - marginLR, top, bottom);

    // vertical lines
    this.currentPage.drawLine({
      start: { x: marginLR, y: top },
      end: { x: marginLR, y: bottom },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: marginLR + 85, y: top },
      end: { x: marginLR + 85, y: bottom },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: marginLR + 165, y: top },
      end: { x: marginLR + 165, y: bottom },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: width - marginLR, y: top },
      end: { x: width - marginLR, y: bottom },
      thickness: 1,
    });
  }

  private addText(
    text: string,
    textOptions: TTextOptions = this.textOptions,
    skipCursorUpdate: boolean = false,
    alignment: TTextAlign = TTextAlign.Left,
    offsetX: number = 0,
    isBold: boolean = false,
  ) {
    if (!this.currentPage) return;
    const {
      fontRegular, fontBold, maxWidth, width, size,
    } = textOptions;
    const font = isBold ? fontBold : fontRegular;
    if (!font) return;
    const textHeight = this.wordWrapHeight(text, maxWidth - offsetX, font);
    const textWidth = Math.min(font.widthOfTextAtSize(text, size), maxWidth - offsetX);
    let xCoord = marginLR + offsetX;

    if (alignment === TTextAlign.Right) {
      xCoord = width - marginLR - textWidth - offsetX;
    } else if (alignment === TTextAlign.Center) {
      xCoord = (width / 2) - ((textWidth - offsetX) / 2);
    }

    this.currentPage.drawText(text, {
      x: xCoord,
      y: this.cursor,
      font,
      size,
      maxWidth: maxWidth - offsetX,
      lineHeight: size + 2,

    });
    if (!skipCursorUpdate) {
      this.cursor -= textHeight;
    }
  }

  private wordWrapHeight(text: string, maxWidth?: number, font?: PDFFont) {
    if (!font || !this.textOptions.fontRegular) return 0;
    const testFont = this.textOptions.fontRegular;
    const getTextWidth = (t: string) => testFont.widthOfTextAtSize(t, fontSize);
    const lines = breakTextIntoLines(text, [" "], maxWidth || this.textOptions.maxWidth, getTextWidth);
    return lines.length * lineHeight;
  }

  private movePageIfNecessary(
    spaceNeeded: number,
    fnPreMove?: () => void,
    fnPostMove?: () => void,
  ) {
    if (!this.doc || this.cursor - spaceNeeded >= marginTB) {
      return;
    }
    if (fnPreMove) fnPreMove();
    this.currentPage = this.doc.addPage();
    this.cursor = this.currentPage.getHeight() - marginTB;
    if (fnPostMove) fnPostMove();
  }

  private drawBox(xLeft: number, xRight: number, yTop: number, yBottom: number) {
    if (!this.currentPage) return;
    this.currentPage.drawLine({
      start: { x: xLeft, y: yTop },
      end: { x: xRight, y: yTop },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: xLeft, y: yBottom },
      end: { x: xRight, y: yBottom },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: xLeft, y: yTop },
      end: { x: xLeft, y: yBottom },
      thickness: 1,
    });
    this.currentPage.drawLine({
      start: { x: xRight, y: yTop },
      end: { x: xRight, y: yBottom },
      thickness: 1,
    });
  }

  private t(text: string): string {
    return this.fnTrans ? this.fnTrans(text) : text;
  }
}
