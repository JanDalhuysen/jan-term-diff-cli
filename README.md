# jan-term-diff-cli

`jan-term-diff-cli` is a command-line interface (CLI) tool that allows you to upload a file to a specified server for diffing against another file uploaded by a different user in the same "room". It then displays the real-time diff results directly in your terminal, with colorized output for easy readability.

## Installation

To install `jan-term-diff-cli` globally, run the following command:

```bash
npm install -g jan-term-diff-cli
```

This will make the `jan-term-diff-cli` command available in your terminal.

## Usage

The `jan-term-diff-cli` tool requires a `room_id` and a `file_path`. Optionally, you can specify the server URL.

### Basic Usage

If no server URL is provided, it defaults to `http://129.151.168.7`.

```bash
jan-term-diff-cli <room_id> <file_path>
```

**Example:**

```bash
jan-term-diff-cli my-unique-room ./path/to/your/file.txt
```

### Specifying a Server URL

You can specify a custom server URL if your diffing server is hosted elsewhere.

```bash
jan-term-diff-cli <server_url> <room_id> <file_path>
```

**Example:**

```bash
jan-term-diff-cli http://localhost:3000 my-dev-room ./another/file.js
```

### How it Works

1.  **Connect to Room:** The CLI connects to the specified `room_id` on the server. If the room doesn't exist, it will be created.
2.  **Upload File:** Your specified file is uploaded to the server.
3.  **Wait for Partner:** The tool will wait for another user to upload their file to the same `room_id`.
4.  **Receive Diff:** Once both files are uploaded, the server performs the diff, and the results are streamed back to your terminal, colorized for easy understanding of additions, deletions, and changes.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the [License Name] - see the [LICENSE.md](LICENSE.md) file for details.
