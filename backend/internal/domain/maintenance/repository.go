package maintenance

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) InitSchema() error {
	query := `
		CREATE TABLE IF NOT EXISTS maintenance_events (
			id SERIAL PRIMARY KEY,
			type VARCHAR(255) NOT NULL,
			expected_time INT NOT NULL,
			section_block VARCHAR(255) NOT NULL,
			status VARCHAR(50) NOT NULL,
			impact VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`
	_, err := r.DB.Exec(context.Background(), query)
	return err
}

func (r *Repository) Create(ctx context.Context, m *MaintenanceEvent) error {
	query := `
		INSERT INTO maintenance_events (type, expected_time, section_block, status, impact, created_at)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`
	m.CreatedAt = time.Now()
	err := r.DB.QueryRow(ctx, query, m.Type, m.ExpectedTime, m.SectionBlock, m.Status, m.Impact, m.CreatedAt).Scan(&m.ID)
	return err
}

func (r *Repository) GetActive(ctx context.Context) ([]MaintenanceEvent, error) {
	query := `SELECT id, type, expected_time, section_block, status, impact, created_at 
	          FROM maintenance_events WHERE status IN ('ongoing', 'planned') ORDER BY created_at DESC`
	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []MaintenanceEvent
	for rows.Next() {
		var e MaintenanceEvent
		if err := rows.Scan(&e.ID, &e.Type, &e.ExpectedTime, &e.SectionBlock, &e.Status, &e.Impact, &e.CreatedAt); err != nil {
			log.Println("Error scanning row:", err)
			continue
		}
		events = append(events, e)
	}
	return events, nil
}

func (r *Repository) End(ctx context.Context, id int) error {
	query := `UPDATE maintenance_events SET status = 'completed' WHERE id = $1`
	_, err := r.DB.Exec(ctx, query, id)
	return err
}
