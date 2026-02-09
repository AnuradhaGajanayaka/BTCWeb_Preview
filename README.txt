# BISTEC Care Preview Website

A static website for BISTEC Care, featuring a Scandinavian design style.

## 🚀 Getting Started

### Prerequisites

You need a local web server to run this project because it loads content via `fetch()` (which may be blocked by CORS policies if opening HTML files directly from the file system).

### Running Locally

You can use any static file server. Examples:

**Using Python:**
```bash
# Run inside the project folder
python3 -m http.server 8000
# Open http://localhost:8000
```

**Using Node.js:**
```bash
npx serve .
```

**Using VS Code:**
- Install the **Live Server** extension.
- Right-click `index.html` and select "Open with Live Server".

## 📂 Project Structure

- **`*.html`**: The page structures/templates.
- **`content/`**: JSON files containing the text and data for each page.
  - `shared.json`: Content shared across pages (header, footer, etc.).
  - `[page].json`: Specific content for that page.
- **`assets/`**: Images, icons, and styles.
- **`app.js`**: The lightweight script that fetches JSON content and populates the HTML.

## 🛠 Customization

To edit the text or images, modify the corresponding JSON files in the `content/` directory. The HTML files primarily define the layout and classes.

## 📦 Deployment

This site is ready for **GitHub Pages**:

1.  Push this repository to GitHub.
2.  Go to **Settings** > **Pages**.
3.  Select **Source**: `Deploy from a branch`.
4.  Select **Branch**: `main` (or `master`) and folder `/` (root).
5.  Save. GitHub will provide the live URL.
