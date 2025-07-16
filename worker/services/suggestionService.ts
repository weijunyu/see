import { DatabaseService } from "./database";
import { encodeBase26 } from "../utils/encoding";

export class SuggestionService {
  private readonly maxAttempts = 100;

  constructor(private db: DatabaseService) {}

  async getNextPageName(): Promise<string> {
    let attempts = 0;

    while (attempts < this.maxAttempts) {
      // Get and increment counter
      const counterValue = await this.db.incrementCounter();
      const suggestedName = encodeBase26(counterValue);

      // Check if page with this name already exists and is not expired
      const pageExists = await this.db.checkPageExists(suggestedName);

      // If no conflict, return this suggestion
      if (!pageExists) {
        return suggestedName;
      }

      attempts++;
    }

    throw new Error("Unable to generate unique page name");
  }
}
