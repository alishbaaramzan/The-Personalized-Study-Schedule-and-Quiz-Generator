"""Vercel serverless function: POST /api/generate_quiz"""
import json
from http.server import BaseHTTPRequestHandler


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(content_length).decode("utf-8") if content_length else "{}"
        try:
            from app.schemas import QuizRequest
            from app.quiz_agent import generate_quiz

            data = json.loads(body)
            req = QuizRequest(**data)
            quiz = generate_quiz(req)
            response = json.dumps({"quiz": quiz}).encode("utf-8")
            status = 200
        except Exception as e:
            response = json.dumps({"error": str(e)}).encode("utf-8")
            status = 500

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        for k, v in cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)
