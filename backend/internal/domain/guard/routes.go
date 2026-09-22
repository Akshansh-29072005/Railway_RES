package guard

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool) {
	group := router.Group("/guard")
	group.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "guard domain is healthy"})
	})
}
