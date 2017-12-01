export interface Recognizer {
	new(options?: any): Recognizer;
	recognizeWith(otherRecognizer: Recognizer | string): Recognizer;
  }