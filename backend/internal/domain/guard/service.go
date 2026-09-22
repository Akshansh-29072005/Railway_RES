package guard

type Service struct {
	Repo *Repository
}

func NewService(r *Repository) *Service {
	return &Service{Repo: r}
}
