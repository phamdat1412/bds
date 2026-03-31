import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  getPublicNewsApi,
  type PublicNewsItem,
} from "../../features/public/publicNews.api";

export default function NewsPage() {
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadNews() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPublicNewsApi();
      setItems(result.data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được tin tức"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  const featured = items[0];
  const sideItems = items.slice(1, 4);
  const moreItems = items.slice(4);

  return (
    <div style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.bgLayer} />

        <div style={styles.inner}>
          <div style={styles.headingWrap}>
            <h1 style={styles.heading}>TIN TỨC & SỰ KIỆN</h1>
          </div>

          {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

          {isLoading ? (
            <div style={styles.loading}>Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div style={styles.empty}>Chưa có bài viết public</div>
          ) : (
            <>
              <div style={styles.topGrid}>
                {featured ? (
                  <Link to={`/news/${featured.slug}`} style={styles.featuredCard}>
                    <div style={styles.featuredImageWrap}>
                      {featured.thumbnailMedia?.url ? (
                        <img
                          src={featured.thumbnailMedia.url}
                          alt={featured.title}
                          style={styles.featuredImage}
                          loading="lazy"
                        />
                      ) : (
                        <div style={styles.noImageLarge}>NO IMAGE</div>
                      )}
                    </div>

                    <div style={styles.featuredContent}>
                      <div style={styles.dateText}>Tin nổi bật</div>
                      <div style={styles.featuredTitle}>{featured.title}</div>
                      <div style={styles.featuredDesc}>
                        {featured.summary || "Đang cập nhật tóm tắt bài viết"}
                      </div>

                      <div style={styles.moreButton}>See more →</div>
                    </div>
                  </Link>
                ) : null}

                <div style={styles.sideList}>
                  {sideItems.map((item) => (
                    <Link key={item.id} to={`/news/${item.slug}`} style={styles.sideItem}>
                      <div style={styles.sideImageWrap}>
                        {item.thumbnailMedia?.url ? (
                          <img
                            src={item.thumbnailMedia.url}
                            alt={item.title}
                            style={styles.sideImage}
                            loading="lazy"
                          />
                        ) : (
                          <div style={styles.noImageSmall}>NO IMAGE</div>
                        )}
                      </div>

                      <div style={styles.sideContent}>
                        <div style={styles.dateText}>Tin tức</div>
                        <div style={styles.sideTitle}>{item.title}</div>
                        <div style={styles.sideDesc}>
                          {item.summary || "Đang cập nhật tóm tắt bài viết"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {moreItems.length > 0 ? (
                <div style={styles.bottomGrid}>
                  {moreItems.map((item) => (
                    <Link key={item.id} to={`/news/${item.slug}`} style={styles.bottomCard}>
                      <div style={styles.bottomImageWrap}>
                        {item.thumbnailMedia?.url ? (
                          <img
                            src={item.thumbnailMedia.url}
                            alt={item.title}
                            style={styles.bottomImage}
                            loading="lazy"
                          />
                        ) : (
                          <div style={styles.noImageBottom}>NO IMAGE</div>
                        )}
                      </div>

                      <div style={styles.bottomContent}>
                        <div style={styles.dateText}>Tin tức</div>
                        <div style={styles.bottomTitle}>{item.title}</div>
                        <div style={styles.bottomDesc}>
                          {item.summary || "Đang cập nhật tóm tắt bài viết"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    background: "#f7f7f7",
  },

  wrapper: {
    position: "relative",
    overflow: "hidden",
    minHeight: "100%",
    padding: "42px 0 70px",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(250,250,250,0.88) 50%, rgba(127,29,29,0.08) 100%)",
  },

  bgLayer: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at right center, rgba(185,28,28,0.08), transparent 30%)",
    pointerEvents: "none",
  },

  inner: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 20px",
    display: "grid",
    gap: 28,
  },

  headingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heading: {
    margin: 0,
    fontSize: 54,
    fontWeight: 600,
    letterSpacing: -1,
    color: "#161616",
    lineHeight: 1.05,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.95fr",
    gap: 24,
    alignItems: "start",
  },

  featuredCard: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
    gap: 0,
    background: "transparent",
  },

  featuredImageWrap: {
    width: "100%",
    height: 430,
    overflow: "hidden",
    background: "#ececec",
  },

  featuredImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  featuredContent: {
    background: "rgba(255,255,255,0.95)",
    padding: "24px 24px 28px",
    display: "grid",
    gap: 10,
  },

  featuredTitle: {
    fontSize: 26,
    fontWeight: 500,
    color: "#222",
    lineHeight: 1.4,
  },

  featuredDesc: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#555",
    maxWidth: 760,
  },

  moreButton: {
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "12px 22px",
    borderRadius: 999,
    border: "1px solid #c53b3b",
    color: "#c53b3b",
    fontSize: 14,
    fontWeight: 700,
  },

  sideList: {
    display: "grid",
    gap: 18,
  },

  sideItem: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: 156,
    background: "transparent",
  },

  sideImageWrap: {
    background: "#ececec",
    overflow: "hidden",
  },

  sideImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  sideContent: {
    background: "rgba(255,255,255,0.95)",
    padding: "22px 22px",
    display: "grid",
    alignContent: "center",
    gap: 8,
  },

  dateText: {
    fontSize: 13,
    color: "#8d8d8d",
    fontWeight: 500,
  },

  sideTitle: {
    fontSize: 19,
    lineHeight: 1.45,
    fontWeight: 500,
    color: "#222",
  },

  sideDesc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#666",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
    marginTop: 8,
  },

  bottomCard: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
    background: "#fff",
  },

  bottomImageWrap: {
    height: 220,
    overflow: "hidden",
    background: "#ececec",
  },

  bottomImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  bottomContent: {
    background: "rgba(255,255,255,0.97)",
    padding: "20px 20px 24px",
    display: "grid",
    gap: 8,
  },

  bottomTitle: {
    fontSize: 20,
    lineHeight: 1.45,
    fontWeight: 500,
    color: "#222",
  },

  bottomDesc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#666",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  noImageLarge: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#efefef",
    color: "#888",
    fontWeight: 700,
  },

  noImageSmall: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#efefef",
    color: "#888",
    fontWeight: 700,
    fontSize: 12,
  },

  noImageBottom: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#efefef",
    color: "#888",
    fontWeight: 700,
  },

  loading: {
    background: "#fff",
    padding: 24,
    color: "#666",
  },

  empty: {
    background: "#fff",
    padding: 24,
    color: "#666",
  },

  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 14,
    borderRadius: 14,
  },
};