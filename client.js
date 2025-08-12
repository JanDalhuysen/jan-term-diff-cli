#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const io = require('socket.io-client');

// --- Main Function ---
async function run()
{
    const {default : chalk} = await import('chalk');
    // --- Argument Parsing ---
    const args = process.argv.slice(2);

    if (args.length === 2)
    {
        args.unshift('http://129.151.168.7');
    }

    if (args.length !== 3)
    {
        console.error(chalk.red('Usage: node client.js [server_url] <room_id> <file_path>'));
        console.error(chalk.yellow('If [server_url] is omitted, it defaults to http://129.151.168.7.'));
        console.error(chalk.yellow('Example: node client.js your-room-id ./file1.txt'));
        console.error(chalk.yellow('Example: node client.js http://localhost:3000 your-room-id ./file1.txt'));
        process.exit(1);
    }

    const [serverUrl, roomId, filePath] = args;
    const absoluteFilePath = path.resolve(filePath);

    if (!fs.existsSync(absoluteFilePath))
    {
        console.error(chalk.red(`Error: File not found at ${absoluteFilePath}`));
        process.exit(1);
    }

    console.log(chalk.blue(`Connecting to room '${roomId}'...`));

    try
    {
        // --- Room Creation ---
        // Make a GET request to the server to ensure the room is created before connecting.
        await axios.get(`${serverUrl}/diffchecker/${roomId}`);
        console.log(chalk.green(`Successfully created or joined room '${roomId}'.`));
    }
    catch (error)
    {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error(chalk.red('Error creating or joining room:'), errorMessage);
        process.exit(1);
    }

    // --- Socket.io Connection ---
    // Connect to the server via Socket.io to receive the final diff.
    const socket = io(serverUrl, {query : {roomId}});

    socket.on('connect', () => {
        console.log(chalk.green('Successfully connected to server. Uploading file...'));

        // --- File Upload ---
        // Once connected, proceed with uploading the file.
        uploadFile(serverUrl, roomId, absoluteFilePath, chalk);
    });

    socket.on('diff_result', (data) => {
        console.log(chalk.cyan.bold('\n--- Diff Result ---'));

        // Colorize the diff output for readability
        const lines = data.diff.split('\n');
        lines.forEach(line => {
            if (line.startsWith('+') && !line.startsWith('+++'))
            {
                console.log(chalk.green(line));
            }
            else if (line.startsWith('-') && !line.startsWith('---'))
            {
                console.log(chalk.red(line));
            }
            else if (line.startsWith('@@'))
            {
                console.log(chalk.cyan(line));
            }
            else
            {
                console.log(line);
            }
        });

        console.log(chalk.cyan.bold('--- End of Diff ---\n'));

        // Disconnect and exit the process
        socket.disconnect();
        process.exit(0);
    });

    socket.on('connect_error', (err) => {
        console.error(chalk.red('Connection failed:'), err.message);
        process.exit(1);
    });
}

/**
 * Uploads the specified file to the server.
 * @param {string} serverUrl - The base URL of the server.
 * @param {string} roomId - The room ID for the session.
 * @param {string} filePath - The absolute path to the file to upload.
 * @param {object} chalk - The chalk instance for logging.
 */
async function uploadFile(serverUrl, roomId, filePath, chalk)
{
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadUrl = `${serverUrl}/diffchecker/upload/${roomId}`;

    try
    {
        await axios.post(uploadUrl, form, {headers : form.getHeaders()});
        console.log(chalk.green('File uploaded successfully!'));
        console.log(chalk.yellow('Waiting for the other user to upload their file...'));
    }
    catch (error)
    {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error(chalk.red('Error uploading file:'), errorMessage);
        process.exit(1);
    }
}

// Run the main function
run();