import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  getPublicProjectsApi,
  getPublicSearchSuggestionsApi,
  type PublicProjectItem,
  type PublicProjectsPagination,
} from "../../features/public/publicProjects.api";
import {
  getProjectBookmarkStatusApi,
  toggleProjectBookmarkApi,
} from "../../features/bookmarks/bookmarks.api";
import { getAccessToken, getRoles } from "../../utils/storage";
import { useDebounce } from "../../hooks/useDebounce";

type FiltersState = {
  keyword: string;
  city: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
};

export default function PublicProjectsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<PublicProjectItem[]>([]);
  const [pagination, setPagination] = useState<PublicProjectsPagination | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});
  const [bookmarkLoadingMap, setBookmarkLoadingMap] = useState<
    Record<string, boolean>
  >({});

  const accessToken = getAccessToken();
  const roles = getRoles();
  const isCustomer = Boolean(accessToken) && roles.includes("customer");

  const [filters, setFilters] = useState<FiltersState>({
    keyword: searchParams.get("keyword") || "",
    city: searchParams.get("city") || "",
    district: searchParams.get("district") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
  });

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    projects: Array<{
      id: string;
      type: "project";
      name: string;
      slug: string;
      location: string;
      projectType: string | null;
    }>;
    properties: Array<{
      id: string;
      type: "property";
      code: string;
      title: string;
      price: string | null;
      areaGross: string | null;
      propertyType: string;
      project: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
    news: Array<{
      id: string;
      type: "news";
      title: string;
      slug: string;
      summary: string | null;
    }>;
  }>({
    projects: [],
    properties: [],
    news: [],
  });

  const debouncedKeyword = useDebounce(filters.keyword, 400);
  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    const setOrDelete = (key: string, value: string) => {
      if (value.trim()) next.set(key, value.trim());
      else next.delete(key);
    };

    setOrDelete("keyword", debouncedFilters.keyword);
    setOrDelete("city", debouncedFilters.city);
    setOrDelete("district", debouncedFilters.district);
    setOrDelete("minPrice", debouncedFilters.minPrice);
    setOrDelete("maxPrice", debouncedFilters.maxPrice);
    setOrDelete("minArea", debouncedFilters.minArea);
    setOrDelete("maxArea", debouncedFilters.maxArea);

    next.set("page", "1");

    setSearchParams(next, { replace: true });
  }, [
    debouncedFilters.keyword,
    debouncedFilters.city,
    debouncedFilters.district,
    debouncedFilters.minPrice,
    debouncedFilters.maxPrice,
    debouncedFilters.minArea,
    debouncedFilters.maxArea,
    setSearchParams,
  ]);

  async function loadProjects() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const currentPage = Number(searchParams.get("page") || "1");

      const result = await getPublicProjectsApi({
        keyword: searchParams.get("keyword") || undefined,
        city: searchParams.get("city") || undefined,
        district: searchParams.get("district") || undefined,
        minPrice: searchParams.get("minPrice")
          ? Number(searchParams.get("minPrice"))
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? Number(searchParams.get("maxPrice"))
          : undefined,
        minArea: searchParams.get("minArea")
          ? Number(searchParams.get("minArea"))
          : undefined,
        maxArea: searchParams.get("maxArea")
          ? Number(searchParams.get("maxArea"))
          : undefined,
        page: currentPage,
        pageSize: 9,
      });

      setItems(result.data.items || []);
      setPagination(result.data.pagination || null);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được danh sách dự án"
      );
      setItems([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSuggestions() {
    const keyword = debouncedKeyword.trim();

    if (!keyword) {
      setSuggestions({ projects: [], properties: [], news: [] });
      return;
    }

    try {
      const result = await getPublicSearchSuggestionsApi(keyword);
      setSuggestions(result.data);
    } catch {
      setSuggestions({ projects: [], properties: [], news: [] });
    }
  }

  async function loadBookmarkStatuses(projectIds: string[]) {
    if (!isCustomer || projectIds.length === 0) {
      setBookmarkMap({});
      return;
    }

    try {
      const results = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const result = await getProjectBookmarkStatusApi(projectId);
            return {
              projectId,
              bookmarked: result.data.bookmarked,
            };
          } catch {
            return {
              projectId,
              bookmarked: false,
            };
          }
        })
      );

      const nextMap: Record<string, boolean> = {};
      results.forEach((item) => {
        nextMap[item.projectId] = item.bookmarked;
      });

      setBookmarkMap(nextMap);
    } catch {
      setBookmarkMap({});
    }
  }

  useEffect(() => {
    loadProjects();
  }, [searchParams]);

  useEffect(() => {
    loadSuggestions();
  }, [debouncedKeyword]);

  useEffect(() => {
    if (!items.length) {
      setBookmarkMap({});
      return;
    }

    loadBookmarkStatuses(items.map((item) => item.id));
  }, [items]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasSuggestions = useMemo(() => {
    return (
      suggestions.projects.length > 0 ||
      suggestions.properties.length > 0 ||
      suggestions.news.length > 0
    );
  }, [suggestions]);

  function goToPage(page: number) {
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages) return;

    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  async function handleToggleBookmark(
    event: React.MouseEvent<HTMLButtonElement>,
    projectId: string
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isCustomer) {
      navigate("/login");
      return;
    }

    setBookmarkLoadingMap((prev) => ({
      ...prev,
      [projectId]: true,
    }));

    try {
      const result = await toggleProjectBookmarkApi(projectId);

      setBookmarkMap((prev) => ({
        ...prev,
        [projectId]: result.data.bookmarked,
      }));
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể cập nhật quan tâm dự án"
      );
    } finally {
      setBookmarkLoadingMap((prev) => ({
        ...prev,
        [projectId]: false,
      }));
    }
  }

  return (
    <div style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.bgLayer} />

        <div style={styles.inner}>
          <div style={styles.headingWrap}>
            <h1 style={styles.heading}>DỰ ÁN NỔI BẬT</h1>
          </div>

          <section style={styles.filterSection}>
            <div style={styles.searchWrap} ref={suggestionBoxRef}>
              <input
                type="text"
                placeholder="Tìm dự án, mã căn, tên căn hộ..."
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
                onFocus={() => setSuggestionsOpen(true)}
                style={styles.searchInput}
              />

              {suggestionsOpen && filters.keyword.trim() && hasSuggestions ? (
                <div style={styles.suggestionDropdown}>
                  {suggestions.projects.length > 0 ? (
                    <div style={styles.suggestionGroup}>
                      <div style={styles.suggestionGroupTitle}>Dự án</div>

                      {suggestions.projects.map((item) => (
                        <button
                          key={`project-${item.id}`}
                          type="button"
                          style={styles.suggestionItem}
                          onClick={() => navigate(`/projects/${item.slug}`)}
                        >
                          <div style={styles.suggestionMain}>{item.name}</div>
                          <div style={styles.suggestionSub}>
                            {item.location || item.projectType || "Dự án"}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {suggestions.properties.length > 0 ? (
                    <div style={styles.suggestionGroup}>
                      <div style={styles.suggestionGroupTitle}>
                        Căn hộ / sản phẩm
                      </div>

                      {suggestions.properties.map((item) => (
                        <button
                          key={`property-${item.id}`}
                          type="button"
                          style={styles.suggestionItem}
                          onClick={() => navigate(`/properties/${item.id}`)}
                        >
                          <div style={styles.suggestionMain}>
                            {item.code} - {item.title}
                          </div>
                          <div style={styles.suggestionSub}>
                            {item.project.name}
                            {item.areaGross ? ` • ${item.areaGross} m²` : ""}
                            {item.price
                              ? ` • ${Number(item.price).toLocaleString()} VND`
                              : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {suggestions.news.length > 0 ? (
                    <div style={styles.suggestionGroup}>
                      <div style={styles.suggestionGroupTitle}>Tin tức</div>

                      {suggestions.news.map((item) => (
                        <button
                          key={`news-${item.id}`}
                          type="button"
                          style={styles.suggestionItem}
                          onClick={() => navigate(`/news/${item.slug}`)}
                        >
                          <div style={styles.suggestionMain}>{item.title}</div>
                          <div style={styles.suggestionSub}>
                            {item.summary || "Bài viết tin tức"}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={styles.filtersGrid}>
              <input
                type="text"
                placeholder="Thành phố"
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, city: e.target.value }))
                }
                style={styles.input}
              />

              <input
                type="text"
                placeholder="Quận / huyện"
                value={filters.district}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, district: e.target.value }))
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Giá từ"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Giá đến"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Diện tích từ"
                value={filters.minArea}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minArea: e.target.value }))
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Diện tích đến"
                value={filters.maxArea}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxArea: e.target.value }))
                }
                style={styles.input}
              />
            </div>
          </section>

          {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

          {isLoading ? (
            <div style={styles.loading}>Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div style={styles.empty}>Không có kết quả phù hợp</div>
          ) : (
            <>
              <div style={styles.grid}>
                {items.map((item) => (
                  <div key={item.id} style={styles.card}>
                    <Link to={`/projects/${item.slug}`} style={styles.cardMainLink}>
                      <div style={styles.cardImageWrap}>
                        {item.thumbnailMedia?.url ? (
                          <img
                            src={item.thumbnailMedia.url}
                            alt={item.name}
                            style={styles.cardImage}
                            loading="lazy"
                          />
                        ) : (
                          <div style={styles.noImageCard}>NO IMAGE</div>
                        )}
                      </div>

                      <div style={styles.cardContent}>
                        <div style={styles.typeText}>
                          {item.projectType || "Dự án"}
                        </div>

                        <div style={styles.cardTitle}>{item.name}</div>

                        <div style={styles.locationText}>
                          {[item.district, item.city]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </div>

                        <div style={styles.cardDesc}>
                          {item.shortDescription || "Đang cập nhật mô tả dự án"}
                        </div>
                      </div>
                    </Link>

                    <div style={styles.cardFooter}>
                      <span>Liên hệ</span>

                      <div style={styles.cardFooterRight}>
                        <button
  type="button"
  style={
    bookmarkMap[item.id]
      ? styles.bookmarkActiveBtn
      : styles.bookmarkBtn
  }
  onClick={(event) => handleToggleBookmark(event, item.id)}
  disabled={bookmarkLoadingMap[item.id]}
>
  {bookmarkLoadingMap[item.id]
    ? "Đang lưu..."
    : bookmarkMap[item.id]
    ? "Đã quan tâm"
    : "Quan tâm"}
</button>

                        <Link to={`/projects/${item.slug}`} style={styles.cardLink}>
                          Xem thêm
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 ? (
                <div style={styles.paginationWrap}>
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                    style={styles.pageButton}
                  >
                    ← Trước
                  </button>

                  <span style={styles.pageInfo}>
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                    style={styles.pageButton}
                  >
                    Sau →
                  </button>
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
      "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(250,250,250,0.90) 50%, rgba(127,29,29,0.08) 100%)",
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
  filterSection: {
    display: "grid",
    gap: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #ececec",
    borderRadius: 24,
    padding: 20,
  },
  searchWrap: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    height: 52,
    padding: "0 16px",
    borderRadius: 14,
    border: "1px solid #d9d9d9",
    outline: "none",
    fontSize: 15,
    background: "#fff",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  input: {
    height: 46,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #dcdcdc",
    outline: "none",
    fontSize: 14,
    background: "#fff",
  },
  suggestionDropdown: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: 16,
    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 20,
  },
  suggestionGroup: {
    padding: 10,
    borderBottom: "1px solid #f1f1f1",
  },
  suggestionGroupTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#999",
    padding: "6px 10px",
    textTransform: "uppercase",
  },
  suggestionItem: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    display: "grid",
    gap: 4,
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
  },
  suggestionSub: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  card: {
    display: "grid",
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid #ececec",
  },
  cardMainLink: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
  },
  cardImageWrap: {
    height: 240,
    overflow: "hidden",
    background: "#ececec",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardContent: {
    background: "rgba(255,255,255,0.97)",
    padding: "20px 20px 24px",
    display: "grid",
    gap: 8,
  },
  typeText: {
    fontSize: 13,
    color: "#8d8d8d",
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 1.4,
    fontWeight: 500,
    color: "#222",
  },
  locationText: {
    fontSize: 15,
    color: "#666",
    fontWeight: 500,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#666",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    padding: "0 20px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
  },
  cardFooterRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  cardLink: {
    color: "#c53b3b",
    textDecoration: "none",
  },
  bookmarkBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  bookmarkActiveBtn: {
    border: "1px solid #16a34a",
    background: "#16a34a",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  noImageCard: {
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
    borderRadius: 16,
  },
  empty: {
    background: "#fff",
    padding: 24,
    color: "#666",
    borderRadius: 16,
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 14,
    borderRadius: 14,
  },
  paginationWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  pageButton: {
    border: "1px solid #dcdcdc",
    background: "#fff",
    borderRadius: 10,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  pageInfo: {
    fontSize: 14,
    color: "#555",
    fontWeight: 600,
  },
};