# Claude Project Notes

## Local Expo Development

- This shell environment often has `CI=1` by default.
- For local development, start Expo with `CI` unset:

```bash
cd example
env -u CI npx expo start
```

- Do not use `CI= npx expo start` (empty value can fail Expo env parsing).
- If port 8081 is occupied:

```bash
lsof -ti:8081 | xargs kill -9
```

Then rerun:

```bash
cd example
env -u CI npx expo start
```
