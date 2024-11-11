export interface Image {
  url: string;
  width?: string;
  height?: string;
}

export interface Scraper {
  getName(): string | null;
  getPrice(): string | null;
  getImages(): Image[] | null;
  getCurrency(): string | null;
  getMetadata(): Record<string, string> | null;
}
