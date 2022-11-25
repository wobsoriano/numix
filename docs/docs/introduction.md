# Introduction

::: warning WARNING
Numix is experimental and this documentation is a work-in-progress.
:::

## What is Numix?

Numix provides you with server side scripts inside your Nuxt pages, which will be transformed to a virtual module and called inside an [h3 event handler](https://github.com/unjs/h3). Loader functions and actions similar to Remix.

## How does it work?

Numix places all the code inside `<script>` in a virtual module and simulates the corresponding endpoint. Numix will then make sure to run your loader on the server and for client side navigations it fetches the data required by the page.

This enables us to import a database or any other stuff that should never reach the client directly inside your Nuxt pages.
