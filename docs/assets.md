# Материалы

> **12.11.2026.** Файлы `static/materials/` (`lesson.txt`, `inquiries.csv`, `workshop-demo.ics`) удалены вместе с прежней версией. CSV текущего разбора формируются в браузере из данных `src/lib/trainer/`. Шрифты и лицензии не менялись. В разборе — вымышленные имена без фамилий и телефонов; демо-адрес формы — `irina@polka.example` в зарезервированном домене `.example`.

Чужих фотографий, логотипов и отзывов нет. Знак в шапке — квадрат из CSS, не скопированный знак.

## Шрифты

Пакеты, фактически установленные 5 ноября 2026:

- `@fontsource/source-serif-4@5.3.1`, лицензия в `package.json`: OFL-1.1. Текст скопирован в `docs/licenses/source-serif-4-OFL-1.1.txt` из `node_modules/@fontsource/source-serif-4/LICENSE`.
- `@fontsource/source-sans-3@5.3.1`, так же OFL-1.1. Текст в `docs/licenses/source-sans-3-OFL-1.1.txt`.

Оба файла LICENSE начинаются с «Google Inc.» и содержат полный SIL Open Font License 1.1 от 26 февраля 2007. В страницу попадают только `woff2` из этих пакетов, latin и cyrillic.

Copyright прочитан из таблицы `name` установленных файлов `.woff`, name ID 0:

- Source Serif 4, `source-serif-4-cyrillic-600-normal.woff`: «© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.»
- Source Sans 3, `source-sans-3-cyrillic-400-normal.woff` и `source-sans-3-latin-600-normal.woff`: «© 2023 Adobe (http://www.adobe.com/), with Reserved Font Name ‘Source’.»

Шрифты не переименовывались и не менялись. Reserved Font Name «Source» в производных названиях не используется.

## Данные

> **13.11.2026.** Раздел ниже описывает прежнюю версию: файлов `static/materials/` и побайтных тестов к ним в репозитории больше нет. Данные текущего разбора — в `src/lib/trainer/cases.ts`; оба CSV формируются в браузере функциями `src/lib/trainer/csv.ts`, их проверяет `src/lib/trainer/engine.test.ts`.

Шесть строк учёта и упражнение демо-11…14 выдуманы для мастерской «Северная полка» и студии «Тихий угол». Имен, телефонов и почты в них нет.

Файлы в `static/materials/`:

- `lesson.txt` — текстовая версия урока
- `inquiries.csv` — те же шесть строк, UTF-8 с BOM
- `workshop-demo.ics` — календарь DEMO

CSV и календарь собираются теми же функциями, что и страницы. Тесты сравнивают файлы с функциями побайтно.

`static/favicon.svg` нарисован для этой страницы.
