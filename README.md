<div>
    <img src="core/web/public/static/logo.svg" width="200" height="200" align="left" alt="logo" />
    <h1 align="center">
        Virnect
    </h1>
    <h3 align="center">
        The web-oriented software system will allow users to communicate with each other on various topics, will greatly simplify the search for interlocutors and provide the possibility of communication.
    </h3>
    <p align="center">
        <img src="https://img.shields.io/badge/django-grey.svg?style=for-the-badge&logo=django&logoColor=cyan" alt="python">
        <img src="https://img.shields.io/badge/react-grey.svg?style=for-the-badge&logo=react&logoColor=cyan" alt="react">
        <img src="https://img.shields.io/badge/progress-developed-green.svg?style=for-the-badge&logo=progress" alt="progress">
    </p>
</div>

---

## Getting Started
1. Clone the repository
```
git clone https://github.com/MagisterFelix/Virnect.git && cd Virnect
```
2. Activate virtual environment
```
python -m venv env && source env/bin/activate
```
3. Install requirements
```
pip install -r requirements.txt && npm install -C core/web
```
4. Make migrations
```
python manage.py makemigrations && python manage.py migrate
```
5. Build the application
```
npm run build -C core/web
```
## Launch
### Django
```
python manage.py runserver
```
### React
```
npm run start -C core/web
```

