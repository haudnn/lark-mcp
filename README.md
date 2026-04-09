# Lark MCP Server

MCP server for Lark Open Platform. Supports Claude Desktop (stdio) and HTTP multi-session transports. ~42 tools across messages, docs (Base/Bitable, Sheets, Documents), and tasks.

## Setup

### 1. Create a Lark Internal App

- Go to https://open.larksuite.com/app → Create app → Internal app
- Note down App ID and App Secret
- Under "Permissions & Scopes", enable required permissions (see table below)
- Under "Version Management & Release", publish the app

### 2. Required Permissions

| Feature | Required Permissions |
|---------|---------------------|
| Messages | `im:message`, `im:message:send_as_bot`, `im:chat:readonly` |
| Base/Bitable | `bitable:app`, `bitable:app:readonly` |
| Sheets | `sheets:spreadsheet`, `sheets:spreadsheet:readonly` |
| Documents | `docx:document`, `docx:document:readonly` |
| Tasks | `task:task`, `task:task:write` |

### 3. Install

```bash
npm install
npm run build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LARK_APP_ID` | Yes | — | Lark internal app ID |
| `LARK_APP_SECRET` | Yes | — | Lark internal app secret |
| `LARK_BASE_URL` | No | `https://open.larksuite.com/open-apis` | Use `https://open.feishu.cn/open-apis` for China region |
| `PORT` | No | `3000` | HTTP server port |
| `LARK_RATE_LIMIT` | No | `50` | Max requests per second |

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env with your Lark app credentials
```

## Usage

### Claude Desktop (stdio)

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lark": {
      "command": "node",
      "args": ["/path/to/lark-mcp/dist/cli.js", "mcp"],
      "env": {
        "LARK_APP_ID": "cli_xxxx",
        "LARK_APP_SECRET": "xxxx"
      }
    }
  }
}
```

Or with CLI args:

```bash
node dist/cli.js mcp --app-id cli_xxxx --app-secret xxxx
```

### HTTP Server (multi-session)

```bash
node dist/cli.js mcp --app-id cli_xxxx --app-secret xxxx --mode http --port 3000
```

Connect via MCP client to `http://localhost:3000/mcp`.

### Docker

```bash
docker build -t lark-mcp .

# Using env file
docker run --rm --env-file .env -p 3000:3000 lark-mcp

# Or passing env vars directly
docker run --rm -e LARK_APP_ID=cli_xxxx -e LARK_APP_SECRET=xxxx lark-mcp

# HTTP mode
docker run --rm --env-file .env -p 3000:3000 lark-mcp --mode http
```

## Available Tools & Presets

### Presets

| Preset | Description |
|--------|-------------|
| `preset.default` | All ~42 tools |
| `preset.readonly` | Read-only GET tools only |
| `preset.messages` | Messages + chats (10 tools) |
| `preset.docs` | Base + Sheets + Documents (22 tools) |
| `preset.tasks` | Tasks + tasklists (10 tools) |

Use with: `node dist/cli.js mcp --tools preset.readonly ...`

### Tool Reference

#### Messages (7 tools)
- `lark_message_send` — Send message to user or chat
- `lark_message_get` — Get message by ID
- `lark_message_list` — List messages in a chat
- `lark_message_update` — Edit a message
- `lark_message_delete` — Delete a message
- `lark_message_reply` — Reply to a message
- `lark_message_forward` — Forward a message

#### Chats (3 tools)
- `lark_chat_list` — List chats
- `lark_chat_get` — Get chat info
- `lark_chat_members` — List chat members

#### Base/Bitable (10 tools)
- `lark_base_create`, `lark_base_get` — App management
- `lark_base_table_list`, `lark_base_table_create` — Table management
- `lark_base_record_list`, `lark_base_record_get`, `lark_base_record_create`, `lark_base_record_update`, `lark_base_record_delete` — Record CRUD
- `lark_base_field_list` — List fields

#### Sheets (6 tools)
- `lark_sheet_create`, `lark_sheet_get`, `lark_sheet_list` — Spreadsheet management
- `lark_sheet_values_read`, `lark_sheet_values_write`, `lark_sheet_values_append` — Value operations

#### Documents (6 tools)
- `lark_document_create`, `lark_document_get` — Document management
- `lark_document_content` — Get raw text content
- `lark_document_blocks_list`, `lark_document_block_create`, `lark_document_block_update` — Block operations

#### Tasks (10 tools)
- `lark_task_create`, `lark_task_get`, `lark_task_list`, `lark_task_update`, `lark_task_delete` — Task CRUD
- `lark_task_complete` — Complete a task
- `lark_task_add_members`, `lark_task_remove_members` — Member management
- `lark_tasklist_list`, `lark_tasklist_create` — Tasklist management

### List all tools

```bash
node dist/cli.js tools
node dist/cli.js tools --project messages
```

## License

MIT
