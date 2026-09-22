package maintenance

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool) {
	repo := NewRepository(db)
	repo.InitSchema()
	service := NewService(repo)
	handler := NewHandler(service)

	group := router.Group("/maintenance")
	group.POST("/record", handler.RecordMaintenance)
	group.GET("/active", handler.GetActiveMaintenance)
	group.PUT("/end/:id", handler.EndMaintenance)
}
