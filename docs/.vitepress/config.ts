import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Numix',
  description: "Write your server code inside Vue SFC's and handle forms easily.",
  lastUpdated: true,

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wobsoriano/numix' },
    ],
    lastUpdatedText: 'Last Updated',
    nav: [
      { text: 'Docs', link: '/docs/introduction', activeMatch: '/docs/' },
      // { text: 'Playground', link: 'https://numix-playground.vercel.app' },
    ],
    sidebar: {
      '/docs/': sidebarDocs(),
    },
    footer: {
      message: 'Released under the MIT License.',
    },
  },
})

function sidebarDocs() {
  return [
    {
      text: 'Introduction',
      collapsible: true,
      items: [
        { text: 'What is Numix?', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
      ],
    },
    {
      text: 'Guides',
      collapsible: true,
      items: [
        { text: 'Data Loading', link: '/docs/data-loading' },
        { text: 'Data Writes', link: '/docs/data-writes' },
      ],
    },
  ]
}
