# BISTEC Care Website — Content Editing Guide (JSON-driven)

This website is designed so **all visible text** is loaded from JSON files.

## 1) Where to edit content
### Shared content for all pages
`content/shared.json`
- Navigation labels
- CTA labels (Book a Demo / WhatsApp Sales)
- Footer labels & address

### Page content
Edit the JSON file for the relevant page:
- Home: `content/index.json`
- Product: `content/product.json`
- Solutions: `content/solutions.json`
- Dental Suite: `content/dental-suite.json`
- Pricing: `content/pricing.json`
- Resources: `content/resources.json`
- Company: `content/company.json`
- Blog list: `content/blog.json`

## 2) How placeholders work
In HTML you will see:
`<h2 data-content="featuresTitle"></h2>`

In JSON you set:
```json
{
  "featuresTitle": "Key features clinics love"
}
```

Supports nested paths like:
`trustBand.0.label`

which corresponds to:
```json
{
  "trustBand":[{"label":"Clinics Trusted"}]
}
```

## 3) Blog posts
### Blog list
`content/blog-posts/index.json` contains the list of posts.

### Each post
Create a new file:
`content/blog-posts/<slug>.json`

Then add it to `index.json` list.

## 4) Meta tags (SEO)
Each page can contain:
```json
"meta": {
  "title": "BISTEC Care — Product",
  "description": "…",
  "ogImage": "assets/og-placeholder.png"
}
```

## 5) Publishing to GitHub
Push the whole folder structure including:
- `content/`
- `assets/`
- all `.html` files
- `app.js`

Then refresh with Ctrl+Shift+R to bypass cache.
