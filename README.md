# 🖼️ Automatic Image Renamer using Gemini API

1.🚀 Clone the repository:

```bash
git clone https://github.com/codenguvl/rename-images
```

2.📦 Install dependencies:

```bash
npm install
```

3.⚙️ Set up environment variables in a `.env` file:

```
GEMINI_API_KEY=
```

4.🏃 Run:

For a single file in Vietnamese:

```bash
node renameImages.js --file=path_to_image1.jpg --language=vi
```

For a single file in English:

```bash
node renameImages.js --file=path_to_image1.jpg --language=en
```

For all images in a directory in Vietnamese:

```bash
node renameImages.js --directory=path_to_directory --language=vi
```

For all images in a directory in English:

```bash
node renameImages.js --directory=path_to_directory --language=en
```

👨‍💻 Created by codenguvl.
