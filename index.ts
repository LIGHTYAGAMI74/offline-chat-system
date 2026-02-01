const clients = new Set<any>()
Bun.serve({
  port: 3000,
  async fetch(request, server) {
    const url = new URL(request.url)

    if (url.pathname === "/ws") {
      if (server.upgrade(request)) {
        return;
      }
      return new Response("error")
    }

    if (url.pathname === "/") {
      return html("public/index.html")
    }

    if (url.pathname === "/login") {
      return html("public/login.html")
    }

    if (url.pathname === "/chat") {
      return html("public/chat.html")
    }

    return new Response("error found")
  },
  websocket: {
    open(ws) {
      clients.add(ws)
      ;(ws as any).user = {}
      console.log("🟢 WebSocket connected");
    },

    message(ws, payload) {
      console.log("📩 Received from client:", payload.toString());
      const data = JSON.parse(payload.toString())
      if (data === "join") {
        ;(ws as any).user.name = data.name;
        return;
      }
      if (data === "chat") {
        const outgoing = {
          id: data.id,
    from: (ws as any).user.name,
    text: data.text,
          }

          ws.send(JSON.stringify(outgoing))
          for(const client of clients){
            if(client!== ws){
              client.send(JSON.stringify(outgoing))
            }
          }

      }
    },

    close(ws) {
      console.log("🔴 WebSocket disconnected");
      clients.delete(ws)
    }
  }
})

async function html(path:string) {
    const file = await Bun.file(path).text()
    return new Response(file,{
        headers:{
            "Content-Type":"text/html"
        }
    })
    
}