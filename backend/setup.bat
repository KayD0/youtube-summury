@echo off
echo Setting up YouTube Search API...

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Setup complete!
echo.
echo To run the API:
echo 1. Make sure you've added your YouTube API key to the .env file
echo 2. Run: python app.py
echo.
echo To test the API:
echo 1. In a separate terminal, run: python test_api.py "your search query"
echo.
echo Press any key to exit...
pause > nul
