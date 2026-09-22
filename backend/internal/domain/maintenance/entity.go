package maintenance

import "time"

type MaintenanceEvent struct {
    ID           int       `json:"id"`
    Type         string    `json:"type"`
    ExpectedTime int       `json:"expected_time"`
    SectionBlock string    `json:"section_block"`
    Status       string    `json:"status"`
    Impact       string    `json:"impact"`
    CreatedAt    time.Time `json:"created_at"`
}
