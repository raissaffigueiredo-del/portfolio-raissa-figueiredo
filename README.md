# Portfólio · Raissa Figueiredo

Site estático: página principal (`index.html`) e quatro estudos de caso (`case-01.html` a `case-04.html`).

## Como rodar no Cursor

1. Descompacte o .zip e abra a pasta no Cursor (File › Open Folder).
2. Escolha uma das opções:
   - **Live Server:** instale a extensão "Live Server" (Ritwick Dey), clique com o botão direito em `index.html` e escolha "Open with Live Server".
   - **Terminal:** no terminal do Cursor, rode `npx serve .` e abra o endereço que aparecer (normalmente http://localhost:3000).

Abrir o `index.html` com dois cliques também funciona, mas um servidor local é o jeito mais fiel ao site publicado.

## Estrutura

```
index.html        Página principal (Proposta C)
case-01.html      Pagamentos Integrados
case-02.html      Programa Aurora Go!
case-03.html      Mutirão de Incidentes
case-04.html      Esteira de Acompanhamento
assets/
  runtime.js      Pequeno motor que monta cada página e suas interações
  *.jpg, *.png    Foto, flyer, ranking, comunicado, pranchas e esteiras
  Curriculo_...pdf  Currículo baixado pelo botão da seção Contato
```

## Como editar

Cada página tem duas partes:

- **Conteúdo e layout:** dentro de `<template data-dc>`. É HTML comum. Os trechos `{{ nome }}` são preenchidos com dados, e `<sc-for>` / `<sc-if>` repetem ou mostram blocos.
- **Dados e interações:** no `<script type="text/x-dc">` no fim do arquivo, na função `renderVals()`. Listas como os cases, as etapas e os cursos ficam ali.

Os estilos estão no `<style>` dentro do `<head>` de cada página. As fontes (Bricolage Grotesque e DM Sans) vêm do Google Fonts e precisam de internet.

## Publicar

A pasta funciona sem nenhum ajuste na Vercel, na Netlify ou no GitHub Pages: basta enviar a pasta inteira.
