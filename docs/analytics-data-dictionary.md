# Analytics data dictionary

Analytics is sent only after the visitor grants `topica_analytics_consent`.
Each event has a client-generated `event_id` for server-side deduplication and a
`session_id` for funnel grouping. The current funnel is:

`page_view → form_start → form_submit → form_success → contacted`.

`form_success` means the public API accepted the lead; `contacted` is an
admin lead status and must be reported separately. Analytics is directional and
must not be treated as the admissions source of truth until export/dashboard
validation is completed.
