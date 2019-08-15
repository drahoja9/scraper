# Web application for online web scraping
#### Author: Jakub Drahoš

## Project structure
All the source files are located inside the `src/` folder - `src/impl/` contains
the code of the applicatin, whereas in `src/thesis/` you will find source files 
of the thesis in the LaTeX format.

You can also find compiled text (PDF and PS formats) inside the `text/` folder.

## Instalation of the app
1. Open your internet browser Google Chrome
2. Go to the `chrome://extensions/` or alternatively click on the controls menu 
(in the top right corner) -> "More tools" -> "Extensions"
3. Turn on the Developer mode (switch is located in the top right corner)
4. Click on the `Load unpacked` button in the top left corner
5. Select the whole `src/impl/` folder in the opened file dialog
6. The extension should be successfully installed by now and ready to use

## Running the tests
1. Make sure you have installed the npm package manager: `npm --version`
2. Go to the folder with source files of the app: `cd src/impl/`
3. Install all the required packages: `npm install`
4. Run the tests `npm test`

## Compilation of the text
1. Go to the folder with source files of the thesis: `cd src/thesis/`
2. Run the command `pdflatex thesis.tex` to compile into PDF format
3. For PS format you can use `pdf2ps thesis.pdf` (if you've already got the PDF
file)
