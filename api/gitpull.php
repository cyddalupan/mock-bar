<?php
// gitpull.php - Pulls latest changes from the Git repository

// You might want to secure this endpoint with some authentication in a real application.

// Set the path to your repository
$repositoryPath = realpath(__DIR__ . '/../'); // Assuming the script is in api/ and .git is in the root

// Execute the git pull command
// Using `2>&1` to redirect stderr to stdout so we can capture all output
$command = "cd " . escapeshellarg($repositoryPath) . " && git pull 2>&1";

$output = shell_exec($command);

// Set header for plain text output for easier debugging
header('Content-Type: text/plain');

echo "Git Pull Output:\n";
echo $output;

// You might want to log the output or send a notification in a real application
?>
