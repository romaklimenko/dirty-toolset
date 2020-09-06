## Поддержка

Эти инструманты вам пригодятся разве что как примеры.
Их назначение – поддержка сайта https://romaklimenko.github.io/dirty и сбор данных для постов на https://dataisbeautiful.d3.ru/.


* `ts-node maintenance/users.ts 1 100` – сохранить в mongo пользователей с id от 1 до 100. И голоса в их карму.
* `make users_to_json` – создать JSON-файлы со списком пользователей и JSON-файлы с исходящими голосами пользователя (по файлу на каждого пользователя).
* `make upload_cache` – загрузить JSON-файлы с кармой в Google Cloud Storage.
