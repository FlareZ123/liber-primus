# Original August 2015 resvolver/c1cada R workspace audit.
# Inspect only names, dimensions and bounded previews; loading is isolated from .GlobalEnv.
source_url <- paste0(
  "https://raw.githubusercontent.com/resvolver/c1cada/",
  "2df89cd45ac08289b794c8c01e5ecb5b7cce94d8/",
  "seewave.Rproj.RData"
)
expected_blob <- "5b3255017501e264348099225d2ab12c16af2394"
target <- tempfile(fileext = ".RData")
on.exit(unlink(target), add = TRUE)
download.file(source_url, target, mode = "wb", quiet = TRUE)
stopifnot(file.info(target)$size == 290763)
actual_blob <- trimws(system2("git", c("hash-object", shQuote(target)), stdout = TRUE))
stopifnot(identical(actual_blob, expected_blob))
cat("Source Git blob verified:", actual_blob, "\n")
env <- new.env(parent = baseenv())
loaded <- sort(load(target, envir = env))
cat("Saved objects:", length(loaded), "\n")
matches <- character()
for (name in loaded) {
  obj <- get(name, envir = env, inherits = FALSE)
  d <- dim(obj)
  shape <- if (is.null(d)) paste0("length=", length(obj)) else paste(d, collapse = "x")
  cat("OBJECT", name, "type=", typeof(obj),
      "class=", paste(class(obj), collapse = "/"), "shape=", shape, "\n")
  if (is.data.frame(obj) || is.matrix(obj)) {
    cat("COLUMNS", name, ":", paste(head(colnames(obj), 30), collapse = ","), "\n")
    if (nrow(obj) %in% c(13041L, 13136L, 13173L))
      cat("SIZED_FRAME", name, "rows=", nrow(obj), "cols=", ncol(obj), "\n")
    if (nrow(obj) == 13173L && ncol(obj) == 12L) matches <- c(matches, name)
  }
  if (is.list(obj) && length(obj) <= 100) {
    for (child in names(obj)) {
      val <- obj[[child]]
      dd <- dim(val)
      if (!is.null(dd) && length(dd) >= 2) {
        cat("NESTED_FRAME", name, "/", child, "shape=", paste(dd, collapse = "x"), "\n")
        if (dd[1] == 13173L && dd[2] == 12L) matches <- c(matches, paste(name, child, sep = "/"))
      }
    }
  }
}
cat("EXACT_13173_12_OBJECTS", paste(matches, collapse = ","), "\n")
