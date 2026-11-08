# Аудит публичного YouTrack REST API — 2026-11-08

На baseline `1c501faf75435bc671e3ee314c1938db3dadcd9f` конечный опубликованный census содержит **282 операции**: **93 covered, 23 partial, 164 missing, 2 uncertain**. Полное покрытие по приведённому ниже критерию — **32,98%**. Действие доступно хотя бы в основном варианте для **118/282 = 41,84%**. Эти два процента отвечают на разные вопросы.

Аудит не реализует отложенные функции и не меняет Issue #1. Генератор и inventory — подготовленные локальные изменения; runtime, зависимости, commands, CI и версии не менялись. Независимое review не проводилось; повторная генерация и отдельный алгоритм пересчёта являются self-check.

## Вселенная и provenance

Машиночитаемый первичный источник: [официальный OpenAPI публичного JetBrains YouTrack](https://youtrack.jetbrains.com/api/openapi.json), полученный 2026-11-08: OAS `3.0.1`, `info.version: 2026.4`, **157 paths / 281 METHOD+path operations**. SHA-256 исходных bytes:

`08d7f307974004570acab1903d66c663710432ff70bffa6c601b70de27ccfb9b`

Это версия опубликованной схемы конкретного публичного развёртывания JetBrains. Build/version установленного пользователем сервера не запрашивался. Ни schema version, ни HTTP availability не являются обещанием совместимости CLI со всеми выпусками, Cloud/Server edition или remote permissions.

Независимый источник множества: [полный официальный Resources index](https://www.jetbrains.com/help/youtrack/devportal/api-resources.html), дата страницы 2026-11-04, HTML built-on `2026-11-06T17:28:18.886702316`. Генератор прочитал **все 169 связанные resource/operations pages** в официальном Markdown-представлении. Supported methods + Resource дают те же **281 операции**, после нормализации path placeholders. 25 страниц не объявляют собственных методов: большинство перенаправляет к operations page; deprecated `issueTags` не получает выдуманную операцию. Полные URLs, hashes каждой страницы и список этих 25 страниц находятся в [source-lock.json](source-lock.json).

[Документация OpenAPI](https://www.jetbrains.com/help/youtrack/devportal/youtrack-openapi-specification.html) отдельно определяет metadata route `/api/openapi.json`. Он получен обычным публичным GET и включён отдельной **282-й** операцией. Сопоставимый с историческим Issue #1 business-only denominator: **281 = 93 covered + 23 partial + 163 missing + 2 uncertain**; reachable **118/281 = 41,99%**, covered **93/281 = 33,10%**. Разница знаменателей всегда равна одной metadata operation.

Upstream URLs изменяемы, неизменяемой upstream revision для этого набора не заявляется. Источник закреплён датой, raw hashes и сохранённой минимальной проекцией [official-operations.json](official-operations.json); raw captures остаются ignored. Повторное скачивание откажет при drift, а не молча заменит baseline. Проекция содержит факты операций/параметров, без server configuration, полных DTO schemas, credentials и samples.

## Правила счёта и статусы

Один item = HTTP METHOD + документированный path template. Источники не задают более крупную стабильную logical-operation identity. `/api` добавляется к относительным OAS paths; query и deployment context в identity не входят. Имена placeholders заменяются по **позиции** на `{p1}`, `{p2}`, `{p3}`: повторяющееся в документации имя child/parent ID не склеивает две позиции. Регистр literal path сохраняется. Разные методы, collection/detail и документированные nested routes считаются отдельно, даже когда возвращают одинаковую entity. Повторная страница/alias не добавляет identity.

- **covered**: core action достигается из shipped CLI handler, документированные query dimensions из OAS/Request syntax доступны через реальные options; есть passing offline request evidence и surface smoke. Это полнота операции в выбранном контракте, не доказательство всех JSON-полей/значений, remote прав, серверных версий или состояния live service.
- **partial**: core action реализован, но конкретные официальные query/body controls не представлены в CLI. Это ограничение публичной CLI capability, часто намеренное; оно само по себе не означает дефект и не разрешает расширение.
- **missing**: нет shipped handler, вызывающего эту METHOD/path. Универсальный HTTP helper, projection вложенных сущностей и похожий эффект command language не заменяют endpoint implementation.
- **uncertain**: core action реализован и tested, но источник противоречив в вопросе полноты параметров. Здесь это две DELETE relationship operations; это **не** отсутствие реализации и **не** отсутствие тестов.

Изучены и parameter tables: у 44 DELETE они дополнительно упоминают `fields`, которого нет в OAS/Request syntax. Этот спорный параметр хранится отдельно как `disputedQueryParameters`, без притворного server-support утверждения. Для двух доступных DELETE CLI не предоставляет projection, поэтому их полнота uncertain. Остальные 42 DELETE отсутствуют независимо от этой неоднозначности.

Семантическая категория не выводится только из метода: `POST commands/assist`, `POST search/assist`, `POST issuesGetter/count` — ReadOnly; остальные POST и DELETE — Update. Локальная категория не гарантирует remote authorization. В default profile ReadOnly включён, Update выключен.

## Измеренные результаты

| Семантика | Всего | Covered | Partial | Missing | Uncertain | Действие доступно |
|---|---:|---:|---:|---:|---:|---:|
| ReadOnly | 140 | 92 | 6 | 42 | 0 | 98 (70,00%) |
| Update | 142 | 1 | 17 | 122 | 2 | 20 (14,08%) |
| Итого | **282** | **93** | **23** | **164** | **2** | **118 (41,84%)** |

Методы: 137 GET, 101 POST, 44 DELETE. Missing: **42 GET + 80 POST + 42 DELETE = 164**. ReadOnly включает три observation POST, поэтому число ReadOnly не равно GET.

Полный список каждой из 282 операций с status/reason, original/normalized paths, API group, permission, command, declaration/service callsites, доступностью human/JSON/RPC/execute, недостающими параметрами и test evidence: [coverage.json](coverage.json) и [coverage.tsv](coverage.tsv). В JSON `binding: null` означает отсутствие shipped команды; `verification` отделяет отсутствие реализации, observed offline evidence и незапущенный live proof. Агрегаты: [summary.json](summary.json).

| Ресурсная группа | Всего | Covered | Partial | Missing | Uncertain |
|---|---:|---:|---:|---:|---:|
| activities | 2 | 0 | 0 | 2 | 0 |
| activitiesPage | 1 | 0 | 1 | 0 | 0 |
| admin.databaseBackup | 5 | 0 | 0 | 5 | 0 |
| admin.globalSettings | 14 | 0 | 0 | 14 | 0 |
| admin.organizations | 5 | 0 | 0 | 5 | 0 |
| admin.projects | 31 | 12 | 0 | 19 | 0 |
| admin.telemetry | 1 | 0 | 0 | 1 | 0 |
| admin.timeTrackingSettings | 8 | 4 | 0 | 4 | 0 |
| agiles | 10 | 5 | 1 | 4 | 0 |
| articles | 29 | 9 | 5 | 15 | 0 |
| assignedRoles | 4 | 0 | 0 | 4 | 0 |
| bundles.build | 10 | 4 | 0 | 6 | 0 |
| bundles.enum | 10 | 4 | 0 | 6 | 0 |
| bundles.ownedField | 10 | 4 | 0 | 6 | 0 |
| bundles.state | 10 | 4 | 0 | 6 | 0 |
| bundles.user | 14 | 7 | 0 | 7 | 0 |
| bundles.version | 10 | 4 | 0 | 6 | 0 |
| commands | 2 | 1 | 1 | 0 | 0 |
| customFields | 9 | 3 | 0 | 6 | 0 |
| groups | 9 | 4 | 1 | 4 | 0 |
| issueLinkTypes | 5 | 2 | 0 | 3 | 0 |
| issues | 48 | 17 | 12 | 17 | 2 |
| issuesGetter | 1 | 1 | 0 | 0 | 0 |
| metadata | 1 | 0 | 0 | 1 | 0 |
| permissions | 1 | 0 | 0 | 1 | 0 |
| roles | 5 | 0 | 0 | 5 | 0 |
| savedQueries | 5 | 2 | 0 | 3 | 0 |
| search | 1 | 1 | 0 | 0 | 0 |
| tags | 6 | 1 | 1 | 4 | 0 |
| users | 13 | 3 | 0 | 10 | 0 |
| workItems | 2 | 1 | 1 | 0 | 0 |

## Ограничения существующих операций

**Шесть ReadOnly partial**: `GET activitiesPage`, issue-specific `activitiesPage`, `GET groups`, `GET tags`, `GET issues`, `GET workItems`.

Недостающие dimensions: activity time/author/activity ID и global issue query; group/tag query; repeated issue `customFields` selection; work-item author/creator и date/created/updated intervals. У work-item `start` — временной API filter; существующий CLI `--start` обозначает `$skip`, поэтому фильтр не считается реализованным. Все точные имена — в `unsupportedQueryParameters` mapping.

**17 Update partial**: create sprint; article create/update, attachment upload и comment add/update; commands apply; issue create/update, attachment upload, comment add/update, custom-field set, link add, tag add, work-item add/update. В основном недоступны `draftId`, `muteUpdateNotifications` и arbitrary response `fields` у части issue writes. Для `commands apply` дополнительно недоступны body controls `comment`, `visibility`, `caret`, `silent`, `runAs`. Положить query parameter внутрь `--body` не эквивалентно передаче его в URL. Generic JSON passthrough у других write handlers сохраняет дополнительные native fields, а не означает доказанную поддержку каждого polymorphic subtype.

**Две uncertain**: `DELETE issues/{p1}/tags/{p2}` и `DELETE issues/{p1}/links/{p2}/issues/{p3}`. Удаляется relation, не issue/tag entity. Действия проверены; неопределён только противоречивый `fields` contract. Полностью exposed Update в текущем критерии — `POST agiles/{p1}/sprints/{p2}`; это не обещание exhaustive sprint schema conformance.

## Полностью отсутствующие capabilities

Нет 163 текущих business routes плюс schema metadata GET: CRUD/admin projects/users/groups/organizations/roles/assignments, custom fields/defaults/instances и bundle writes; server/time settings и work-item types; большинство deletion wrappers; issue reactions, project relation, attachment/VCS edits; article tags/reactions/hierarchy writes/cleanup; agile administration; saved-query/tag writes; activity item feeds/details. Перечень **полный в mapping**, а не ограничен этими примерами.

`commands apply` уже может выполнять команды YouTrack с последствиями move/delete/clone/workflow и остаётся Update. Этот эффект не покрывает отдельные REST routes DELETE/project/admin. Universal `deleteObject` вызывается в response-body tests для `DELETE issues/{id}`, но shipped issue-delete command отсутствует — этот маршрут остаётся missing.

## Сверка с deferred Issue #1

[Issue #1](https://github.com/iXab3r/youtrack-cli/issues/1) и owner comment от 2026-11-07 сохраняют deferred scope; аудит не выдаёт approval. Исторические 163 строки: 140 P2 + 23 P3, 41 ReadOnly + 122 Update. Текущие missing business operations тоже 163, однако **множества отличаются**:

- 162 identities совпадают.
- Историческая `POST /api/assignedRoles/{roleID}` отсутствует в captured current OAS, Markdown и свежем HTML.
- Текущая `POST /api/assignedRoles` объявлена collection resource и OAS. Её нельзя молча засчитать как старую identity или считать отдельной реализованной возможностью.

`source-lock.json` закрепляет свежие HTML corroborations. Закэшированное поисковым инструментом HTML-представление operations page ещё показывало прежний POST; решение опирается на сохранённые свежие bytes и согласованные OAS/Markdown, с явным сохранением исторической строки. Remote issue не редактировался.

Источники также оставляют unresolved notification profile path (`.../notifications` в Resource/OAS против `.../notifications/{profileID}` в Request syntax), group ownUsers POST path-versus-sample, User email writability (атрибут read-only против update sample). Эти будущие capabilities missing; неопределённость API семантики записана отдельно и не превращается в фиктивный coverage. Новую реализацию надо начинать с повторной проверки конкретного slice.

## Границы и известная неполнота источника

Данный finite denominator охватывает опубликованные built-in resources и документированную schema metadata route. Он **не** утверждает, что известен каждый URL, принимаемый любой инсталляцией.

- Separate Hub REST `/api/rest/...` и OAuth не включены. Текущие YouTrack `/api/users`, groups, roles, organizations, project teams включены: они не исключаются лишь потому, что пересекаются с Hub. [REST changelog](https://www.jetbrains.com/help/youtrack/devportal/api-changelog.html) датирует identity/team additions 2026.1, `User.userType` — 2026.2; [URL guide](https://www.jetbrains.com/help/youtrack/devportal/api-url-and-endpoints.html) различает Cloud/Server base contexts. Audit не назначает новый supported-version policy.
- Deprecated `/rest`, internal/UI, workflow/import JavaScript API не являются этим публичным REST universe.
- App extension handlers имеют пять документированных scopes, но конечный список зависит от установленных приложений. Пять templates не превращаются в пять покрываемых операций; их нет в denominator. ReadOnly для произвольного handler не предполагается.
- Issue/article binary downloads следуют единственной URL из точной attachment metadata, без bearer/cookies. Это существующие workflow capabilities, не дополнительные фиксированные routes: подписанная/CDN/file URL не добавляет выдуманную `/api/files` operation. Article export и batch validate/apply также переиспользуют существующие операции.
- Три Reports candidates из исторического [официального support example](https://youtrack-support.jetbrains.com/hc/en-us/community/posts/17238863984402-Time-report-query) отсутствуют в текущих полном resource index и OAS: `GET reports/{reportID}`, `GET reports/{reportID}/status`, `POST reports/{reportID}/status`. Текущее version support **не установлено**; они остаются вне denominator и не получают invented implementation approval. Supplemental uncertainty отдельно от двух uncertain completeness rows внутри census.

## Доказательства и границы проверки

`npm ci --ignore-scripts` установил существующий lock; Core остаётся ровно `@eyeauras/cli-factory: 0.7.1`. Обычный `npm test` — **440 passed, 0 failed/skipped**. Наблюдение passing suite на фактическом `request` boundary обнаружило все 118 reachable operations, с test-file/line pointers; route-only вызов транспорта для DELETE issue отдельно исключён из shipped coverage. Наблюдение само по себе не утверждает, что каждый вызов проверяет все wire fields: существующие suites надо читать по приведённым ссылкам.

Дополнительный audit smoke обошёл **121 service leaf**, **123 variants** с учётом двух `--direct`: 5 workflows исключены из endpoint counter, 118 route variants достигли ровно одного HTTP request каждый. Для всех 118 отдельно прошли execute/human/JSON/RPC через настоящее дерево и MSW; сравнивались method/path/query, JSON/RPC validity. Каждая категория проверена при отключённой другой категории; собственный gate denial в execute дал ноль HTTP requests. Smoke не заменяет детальные independently-authored existing contract tests и не является live proof.

Audit hooks лишь expose existing product definition и наблюдают product request function; handlers и Core runtime не подменяются новой реализацией. Filesystem/profile/credentials — synthetic fixture + memory store. Не выполнялись real-profile proof, login, real writes, releases, CI mutations или remote publication.

Повторная генерация должна давать byte-identical official facts/coverage/summary/TSV. Отдельный `crosscheck.py` заново обходит raw OAS и все reference tables, сверяет множества, дубли, строки TSV, status/group/permission sums и известную одну backlog correction. Это **self-check другим алгоритмом**, не fresh-context independent review. Независимый planning/change review остаётся следующим этапом оркестратора; агенты не создавались по прямому ограничению задачи.

## Что сохранять при будущем расширении

Неприкосновенный baseline: command names, application ID `youtrack-cli`, package identity, profile URL/context/explicit-port preservation; permanent-token auth, current-user AppData/secret namespaces и изоляция профилей/каждого RPC invocation. ReadOnly enabled / Update disabled by default, admission до effects; remote authorization отдельно.

47 offset lists сохраняют `{count,items,hasMore,nextStart}`, defaults 50/0, один request без lookahead, неизвестный конец у непустой короткой страницы, raw-row offset, пустую positive-size end probe, overflow/cancellation checks. `issues list --all` требует caller result budget, допускает optional byte budget, deduplicates IDs, не возвращает частичный успех и не превращает search в автоматические write targets. Два activity cursor commands сохраняют native cursor/direction; generic traversal не вводится.

Сохранять no automatic mutation retries, native JSON passthrough и projections, sanitized causal diagnostics и verbose stacks, quiet output EPIPE 141, исходные command/cleanup failures, explicit no-overwrite file publication и cwd/explicit destinations. README содержит устаревшую краткую фразу о profile AppData downloads; подробный download раздел и product DESIGN правильно задают cwd. Это найденная documentation inconsistency, в этом audit не исправлялась.

Риски и стоимость: главный объём гэпов — 122 state-changing operations, administrative permissions, чувствительные identity/license/backup data, version/source contradictions, non-atomic writes и file handling. Текущий integration baseline: 3 813 nonblank handwritten TS lines / 38 src files; 7 482 / 42 tests/support files; 165 / 1 proof file. Handwritten Core source этим checkout не предоставляется: общий Core+integration authoring delta нельзя честно вывести из compiled npm artifacts. Runtime upgrade или новая абстракция не нужны для самого audit; любой будущий общий механизм требует отдельной authority и consumer evidence.

Draft story/milestone proposal и вся локальная evidence/coordination находятся в ignored `.workspace/workstreams/rest-api-coverage-audit/`, а не в продуктовой спецификации. Ни одна новая REST operation этим audit не принята. Owner должен отдельно утвердить stories/order/milestones перед production code; +50/+100/+150/final-remainder authoring reviews отсчитываются от реального будущего increment, не от количества flags/aliases.

## Воспроизведение

Из корня checkout, без live profile:

```sh
npm ci --ignore-scripts
npm run build
mkdir -p .workspace/workstreams/rest-api-coverage-audit
node --enable-source-maps scripts/rest-api-audit/probe.mjs
```

Probe использует сохранённую minimal official projection. Для наблюдения существующей offline suite очистить только точный audit trace, затем запустить:

```sh
node -e "require('node:fs').writeFileSync('.workspace/workstreams/rest-api-coverage-audit/test-requests.ndjson', '')"
node --enable-source-maps --import ./scripts/rest-api-audit/observe-tests.mjs --test dist/tests/*.test.js
node scripts/rest-api-audit/generate.mjs
```

Raw source replay — отдельный read-only public-source шаг. Mutable upstream content должен **совпасть с pinned hashes**; drift требует нового явно записанного baseline, а не обхода проверки:

```sh
python3 scripts/rest-api-audit/capture.py .workspace/workstreams/rest-api-coverage-audit
python3 scripts/rest-api-audit/extract.py .workspace/workstreams/rest-api-coverage-audit .workspace/workstreams/rest-api-coverage-audit/regenerated-source
```

Для полного cross-check нужен сохранённый публичный Issue snapshot (на дату audit) и raw captures. В текущем workstream они присутствуют. Новый capture через `gh` при изменившемся backlog не считается исходным snapshot:

```sh
gh issue view 1 --repo iXab3r/youtrack-cli --json number,title,body,comments,url,state > .workspace/workstreams/rest-api-coverage-audit/issue-1.json
python3 scripts/rest-api-audit/crosscheck.py .workspace/workstreams/rest-api-coverage-audit docs/rest-api-coverage
```

Инструменты требуют Node с synchronous `node:module.registerHooks` (проверено на Node 26.13.0); это требование audit tools, не изменение Node support CLI. Точное повторение original evidence сохраняется в ignored captures; чистый clone может регенерировать mapping из pinned projection и synthetic suite, но upstream нельзя заставить снова отдать старые bytes после обновления.
