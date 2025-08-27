# React Boilerplate

[![Build Status](https://img.shields.io/github/actions/workflow/status/takiyon-org/react-boilerplate/main.yml?branch=main&style=flat-square)](https://github.com/takiyon-org/react-boilerplate/actions/workflows/main.yml)

A sensible, minimal, and server-agnostic boilerplate for React projects.

## Features

* Simple build and file watching
* Cache-busted resources
* Latest JavaScript features
* JavaScript linting with ESLint
* Support for Sass and next-generation CSS
* Server-agnostic
* Fully valid and semantic HTML

## Getting Started

Start the development server:

```
npm run dev-server
```

Then edit any of the source files to see the changes live.

## Remote Deployment

When deploying to another system, ensure that the HTTP headers forbid caching:

```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```
