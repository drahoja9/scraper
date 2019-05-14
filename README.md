# Webová aplikace pro online web scraping
#### Autor: Jakub Drahoš

## Struktura projektu
Nacházíte se v kořenové složce celé bakalářské práce. Ve složce `src/` najdete  zdrojové kódy -- `src/impl/` obsahuje kód samotné aplikace, `src/thesis/` pak zdrojovou formu práce ve formátu LaTeX.

Ve složce `text/` je zkompilovaný text práce ve formátech PDF a PS.

## Návod ke kompilaci textu
1. Přejděte do složky se zdrojovou formou práce: `cd src/thesis`
2. Spusťte příkaz `pdflatex thesis.tex`
3. Pro převod do formátu PS lze využít příkaz `pdf2ps thesis.pdf`

## Návod k instalaci aplikace
1. Otevřete Váš internetový prohlížeč Google Chrome
2. Přejděte na stránku rozšíření: `chrome://extensions/`
3. Zapněte Delevoper mode (přepínač se nachází v pravém horním rohu)
4. Klikněte na tlačítko `Load unpacked` nacházející se v levém horním rohu
5. V otevřeném dialogu vyberte celou složku `src/impl/`
6. Rozšíření by mělo být úspěšně nainstalováno a připraveno k použití

## Návod ke spuštění testů
1. Ujistěte se, že máte nainstalovaný balíčkovací manažer npm: `npm --version`
2. Přejděte do složky se zdrojovými kódy: `cd src/imp`
3. Nainstalujte všechny potřebné balíčky: `npm install`
4. Spusťte testy: `npm test`
