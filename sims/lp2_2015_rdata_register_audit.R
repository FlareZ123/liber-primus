# Original August 2015 resvolver/c1cada R workspace audit.
# Inspect only names, dimensions and bounded previews; loading is isolated from .GlobalEnv.
source_root <- "https://raw.githubusercontent.com/resvolver/c1cada/2df89cd45ac08289b794c8c01e5ecb5b7cce94d8/"
source_url <- paste0(source_root, "seewave.Rproj.RData")
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
  d <- attr(obj, "dim", exact = TRUE)
  cls <- attr(obj, "class", exact = TRUE)
  shape <- if (isS4(obj)) "S4-object" else if (is.null(d)) paste0("length=", length(obj)) else paste(d, collapse = "x")
  cat("OBJECT", name, "type=", typeof(obj),
      "class=", paste(cls, collapse = "/"), "shape=", shape, "\n")
  if (isS4(obj)) next
  if (is.data.frame(obj) || is.matrix(obj)) {
    cat("COLUMNS", name, ":", paste(head(colnames(obj), 30), collapse = ","), "\n")
    if (nrow(obj) %in% c(13041L, 13136L, 13173L))
      cat("SIZED_FRAME", name, "rows=", nrow(obj), "cols=", ncol(obj), "\n")
    if (nrow(obj) == 13173L && ncol(obj) == 12L) matches <- c(matches, name)
  }
  if (is.list(obj) && length(obj) <= 100) {
    for (child in names(obj)) {
      val <- obj[[child]]
      if (isS4(val)) next
      dd <- attr(val, "dim", exact = TRUE)
      if (!is.null(dd) && length(dd) >= 2) {
        cat("NESTED_FRAME", name, "/", child, "shape=", paste(dd, collapse = "x"), "\n")
        if (dd[1] == 13173L && dd[2] == 12L) matches <- c(matches, paste(name, child, sep = "/"))
      }
    }
  }
}
cat("EXACT_13173_12_OBJECTS", paste(matches, collapse = ","), "\n")

# The 13,041-row character table is an independent 2015 transcription of LP2 pages 0–56.
# Print its alphabet map and the eleven rows that disagree with the current canonical GP29 stream.
for (name in c("gems", "fct_list", "notesprimes", "testers", "words", "words_list")) {
  if (!exists(name, envir = env, inherits = FALSE)) next
  obj <- get(name, envir = env, inherits = FALSE)
  cat("\nDETAIL", name, "\n")
  if (name == "gems" && (is.data.frame(obj) || is.matrix(obj))) print(obj, row.names = FALSE)
  else if (is.data.frame(obj) || is.matrix(obj)) {
    print(utils::head(obj, 12), row.names = FALSE)
    cat("TAIL\n")
    print(utils::tail(obj, 8), row.names = FALSE)
  } else if (is.atomic(obj)) print(obj)
  else str(obj, max.level = 2, give.attr = FALSE)
}
if (exists("all_dat_ass", envir = env, inherits = FALSE)) {
  d <- get("all_dat_ass", envir = env, inherits = FALSE)
  cat("\nALL_DAT_ASS_FIRST_ROWS\n")
  print(utils::head(d, 8), row.names = FALSE)
  cat("ALL_DAT_ASS_LAST_ROWS\n")
  print(utils::tail(d, 8), row.names = FALSE)
  target_pos <- c(1539L, 1928L, 2088L, 3099L, 6533L, 7794L,
                  8061L, 8078L, 8705L, 8707L, 9299L)
  if ("ttl_pos" %in% names(d)) {
    cat("TRANSCRIPTION_DISAGREEMENT_ROWS\n")
    print(d[d$ttl_pos %in% target_pos, , drop = FALSE], row.names = FALSE)
  }
}

# A same-repository 58,152-byte file named 'thefile' is a possible historical
# extraction artifact. Identify it before treating it as the missing OutGuess output.
payload_url <- "https://raw.githubusercontent.com/resvolver/c1cada/00e73d84d9ab4e9b780d77c7316a8915bda42f52/thefile"
payload <- tempfile()
download.file(payload_url, payload, mode = "wb", quiet = TRUE)
stopifnot(file.info(payload)$size == 58152)
payload_blob <- trimws(system2("git", c("hash-object", shQuote(payload)), stdout = TRUE))
stopifnot(identical(payload_blob, "dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6"))
raw <- readBin(payload, what = "raw", n = 58152L)
b <- as.integer(raw)
p <- as.numeric(table(factor(b, levels = 0:255))) / length(b)
entropy <- -sum(p[p > 0] * log2(p[p > 0]))
cat("\nTHEFILE_SIZE", length(raw), "\n")
cat("THEFILE_GIT_BLOB", payload_blob, "\n")
cat("THEFILE_HEAD_HEX", paste(sprintf("%02x", b[1:64]), collapse = ""), "\n")
cat("THEFILE_TAIL_HEX", paste(sprintf("%02x", tail(b, 64)), collapse = ""), "\n")
cat("THEFILE_BYTE_ENTROPY", sprintf("%.6f", entropy), "\n")
cat("THEFILE_MAGIC_DECIMAL", paste(b[1:16], collapse = ","), "\n")
if (length(b) >= 44L && identical(rawToChar(raw[1:4]), "RIFF") &&
    identical(rawToChar(raw[9:12]), "WAVE")) {
  sample_rate <- sum(b[25:28] * 256^(0:3))
  channels <- sum(b[23:24] * 256^(0:1))
  bits_per_sample <- sum(b[35:36] * 256^(0:1))
  cat("THEFILE_WAVE", "channels=", channels, "sample_rate=", sample_rate,
      "bits_per_sample=", bits_per_sample, "\n")
}
printable <- vapply(b, function(x) if (x >= 32L && x <= 126L) rawToChar(as.raw(x)) else ".", character(1))
safe <- paste0(printable, collapse = "")
hits <- regmatches(safe, gregexpr("[ -~]{8,}", safe, perl = TRUE))[[1]]
cat("THEFILE_PRINTABLE_RUNS", paste(head(hits, 30), collapse = " | "), "\n")
unlink(payload)
