package router

import (
	"embed"
	"fmt"
	"hash/fnv"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetRouter(router *gin.Engine, buildFS embed.FS, indexPage []byte) {
	SetApiRouter(router)
	SetDashboardRouter(router)
	SetRelayRouter(router)
	SetVideoRouter(router)
	frontendBaseUrl := os.Getenv("FRONTEND_BASE_URL")
	if common.IsMasterNode && frontendBaseUrl != "" {
		frontendBaseUrl = ""
		common.SysLog("FRONTEND_BASE_URL is ignored on master node")
	}
	if frontendBaseUrl == "" {
		SetWebRouter(router, buildFS, indexPage)
	} else {
		frontendBaseUrl = strings.TrimSuffix(frontendBaseUrl, "/")
		newFrontendBaseUrl := strings.TrimSuffix(os.Getenv("WEB_NEW_FRONTEND_BASE_URL"), "/")
		newFrontendCanary, _ := strconv.Atoi(common.GetEnvOrDefaultString("WEB_NEW_CANARY_PERCENT", "0"))
		router.NoRoute(func(c *gin.Context) {
			c.Set(middleware.RouteTagKey, "web")
			if newFrontendBaseUrl != "" && newFrontendCanary > 0 && shouldRouteToNewFrontend(c.ClientIP(), newFrontendCanary) {
				c.Redirect(http.StatusMovedPermanently, fmt.Sprintf("%s%s", newFrontendBaseUrl, c.Request.RequestURI))
				return
			}
			c.Redirect(http.StatusMovedPermanently, fmt.Sprintf("%s%s", frontendBaseUrl, c.Request.RequestURI))
		})
	}
}

func shouldRouteToNewFrontend(seed string, percent int) bool {
	if percent <= 0 {
		return false
	}
	if percent >= 100 {
		return true
	}
	if seed == "" {
		return false
	}
	hasher := fnv.New32a()
	_, _ = hasher.Write([]byte(seed))
	return int(hasher.Sum32()%100) < percent
}
