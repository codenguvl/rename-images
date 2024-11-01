const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

class ImageRenamer {
  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API Key not found in environment variables.");
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async renameImage(imagePath, language = "en") {
    const newName = await this.generateImageName(imagePath, language);
    if (newName) {
      const baseName = newName.replace(/[<>:"/\\|?*\n]+/g, "").trim();
      const ext = path.extname(imagePath);
      const dir = path.dirname(imagePath);

      let newFilePath = path.join(dir, `${baseName}${ext}`);
      let counter = 1;

      while (fs.existsSync(newFilePath)) {
        newFilePath = path.join(dir, `${baseName} (${counter})${ext}`);
        counter++;
      }

      fs.renameSync(imagePath, newFilePath);
    }
  }

  async generateImageName(imagePath, language) {
    try {
      const imageData = Buffer.from(fs.readFileSync(imagePath)).toString(
        "base64"
      );

      const prompt =
        language === "vi"
          ? "Tạo tên phù hợp cho hình ảnh này bằng tiếng Việt."
          : "Generate a suitable name for this image in English.";

      const image = {
        inlineData: {
          data: imageData,
          mimeType: "image/" + path.extname(imagePath).slice(1),
        },
      };

      const result = await this.model.generateContent([prompt, image]);

      let newName = result.response.text().split("\n")[0];
      newName = newName.replace(/[<>:"/\\|?*\n]+/g, "");
      newName = newName.replace(/^-+|-+$/g, "");

      return newName.trim();
    } catch (error) {
      console.error(`Error processing image ${imagePath}:`, error.message);
      return null;
    }
  }

  async renameImagesInDirectory(directory, language) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const extname = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(extname)) {
        const filePath = path.join(directory, file);
        await this.renameImage(filePath, language);
      }
    }
  }
}

const main = async () => {
  const args = process.argv.slice(2);
  const directory = args
    .find((arg) => arg.startsWith("--directory="))
    ?.split("=")[1];
  const language =
    args.find((arg) => arg.startsWith("--language="))?.split("=")[1] || "en";
  const files = args
    .filter((arg) => arg.startsWith("--file="))
    .map((arg) => arg.split("=")[1]);

  const renamer = new ImageRenamer();

  if (files.length > 0) {
    for (const file of files) {
      await renamer.renameImage(file, language);
    }
  }

  if (directory) {
    await renamer.renameImagesInDirectory(directory, language);
  }
};

main().catch((err) => console.error(err));
