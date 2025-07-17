# Get the current directory
$currentDir = Get-Location

# Define the output text file
$outputFile = Join-Path -Path $currentDir -ChildPath "all_contents.txt"

# Clear the content of the output file if it exists
if (Test-Path $outputFile) {
    Clear-Content -Path $outputFile
}

# Get all files in the current directory and subdirectories
Get-ChildItem -Path $currentDir -Recurse -File | ForEach-Object {
    # Write the file name to the output file
    Add-Content -Path $outputFile -Value "Contents of $($_.FullName):"

    # Write the content of the file to the output file
    Get-Content -Path $_.FullName | Add-Content -Path $outputFile

    # Add a separator for readability
    Add-Content -Path $outputFile -Value "`r`n"  # Adds a new line
}

Write-Host "All contents have been copied to $outputFile"
