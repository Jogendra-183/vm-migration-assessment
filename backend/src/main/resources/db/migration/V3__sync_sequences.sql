-- V3__sync_sequences.sql
-- Synchronize all table ID sequences with current MAX(id) to allow dynamic insertions starting from ID 41+

SELECT setval('servers_id_seq', COALESCE((SELECT MAX(id) FROM servers), 1));
SELECT setval('applications_id_seq', COALESCE((SELECT MAX(id) FROM applications), 1));
SELECT setval('dependencies_id_seq', COALESCE((SELECT MAX(id) FROM dependencies), 1));
SELECT setval('performance_metrics_id_seq', COALESCE((SELECT MAX(id) FROM performance_metrics), 1));
SELECT setval('assessments_id_seq', COALESCE((SELECT MAX(id) FROM assessments), 1));
SELECT setval('vm_recommendations_id_seq', COALESCE((SELECT MAX(id) FROM vm_recommendations), 1));
SELECT setval('migration_waves_id_seq', COALESCE((SELECT MAX(id) FROM migration_waves), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
