# Next Dev Lock And Port Reset

Use this when `next dev` reports `.next/dev/lock` conflicts or `EADDRINUSE` on local ports.

## Symptoms
- `Unable to acquire lock at .../.next/dev/lock`
- `listen EADDRINUSE: address already in use 127.0.0.1:<port>`

## Recovery sequence
```bash
cd /Users/hunterlapeyre/Developer/obieo
pkill -f "next dev" || true
rm -f .next/dev/lock
npm run dev -- --hostname 127.0.0.1 --port 4010
```

## If port still blocked
```bash
lsof -iTCP:4010 -sTCP:LISTEN -n -P
PID=$(lsof -tiTCP:4010 -sTCP:LISTEN); [ -n "$PID" ] && kill $PID
```

## Notes
- Killing only one listener is sometimes insufficient; another `next dev` process may still hold the lock.
- Re-test with one terminal/tab to avoid parallel dev instances.
