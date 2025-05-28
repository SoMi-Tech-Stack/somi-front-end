export interface ScoreDetails {
  musicXmlUrl?: string;
  pdfUrl?: string;
  title: string;
  composer: string;
  details: {
    key?: string;
    timeSignature?: string;
    yearComposed?: string;
  };
}