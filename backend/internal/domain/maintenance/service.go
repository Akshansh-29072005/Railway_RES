package maintenance

import "context"

type Service struct {
	Repo *Repository
}

func NewService(r *Repository) *Service {
	return &Service{Repo: r}
}

func (s *Service) CreateMaintenance(ctx context.Context, dto CreateMaintenanceDTO) (*MaintenanceEvent, error) {
	event := &MaintenanceEvent{
		Type:         dto.Type,
		ExpectedTime: dto.ExpectedTime,
		SectionBlock: dto.SectionBlock,
		Status:       dto.Status,
		Impact:       dto.Impact,
	}
	err := s.Repo.Create(ctx, event)
	return event, err
}

func (s *Service) GetActiveMaintenance(ctx context.Context) ([]MaintenanceEvent, error) {
	return s.Repo.GetActive(ctx)
}

func (s *Service) EndMaintenance(ctx context.Context, id int) error {
	return s.Repo.End(ctx, id)
}
