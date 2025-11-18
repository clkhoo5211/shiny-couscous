"""
Minimal test handler to verify Vercel Python setup works.
"""
def handler(req, res):
    """Simple test handler."""
    res.status(200).send('{"status": "test works!"}')

