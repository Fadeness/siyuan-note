# Siyuan-note

This extention adds support for publishing Markdown files as notes to [SiYuan](https://github.com/siyuan-note/siyuan/tree/master).

## Features

- `Siyuan Publish`: Publish markdown files to your SiYuan server.
- `Siyuan New`: Create an empty markdown file with metadata template

## Requirements

Have the latest Visual Studio Code installed.

## Extension Settings

- `siyuan-note.host`: Host of your SiYuan server endpoint, default to be `127.0.0.1`.
- `siyuan-note.port`: Port of your SiYuan server endpoint, default to be `6806`.
- `siyuan-note.token`: Your SiYuan API token (can be found at `settings` -> `about` of your SiYuan application).

## Usage

- denote the hierarchy with `/`, e.g. "level1/level2/level3/mynote", in the `path` field of the metadata.
- tags are organized in the form of `tag1,tag2`, seperated by `,`.

```yaml
---
title: myTitle
tags: tag1,tag2
path: notebook/subnotebook1/subnotebook2
---
```

Upper front matter implies a note titled `myTitle` with tags `tag1` and `tag2` will be created under the `subnotebook2` folder. 

## Important Notes

- In Siyuan, there is no notion of notebook hierarchy. If a block within a note or a block, and with no other blocks within it, we consider it a `subnotebook`. With this, we can model a notebook hierarchy.
- If there is already a note with the same path and title as your current note, `publish` command will delete it, then upload your current note to the server. You can deem this behaviour an update to the existing note.

## Recommended Siyuan Extensions

- `多层笔记本`
- `块级横向滚动条`

## Ideology

- Organize your knowledge using Markdown files, and manage them with Git.
- We aim for the portability and platform independence.
- Write your Markdown files in code editors (e.g., Visual Studio Code) for a better Markdown experience.
- Use cross-platform note apps (e.g., SiYuan, Evernote) solely for viewing.
- Own your knowledge.