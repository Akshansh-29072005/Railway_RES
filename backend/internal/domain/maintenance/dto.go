package maintenance

type CreateMaintenanceDTO struct {
    Type         string `json:"type" binding:"required"`
    ExpectedTime int    `json:"expected_time" binding:"required"`
    SectionBlock string `json:"section_block" binding:"required"`
    Status       string `json:"status" binding:"required"`
    Impact       string `json:"impact" binding:"required"`
}
