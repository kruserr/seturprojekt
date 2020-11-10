from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)




class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username

#db.create_all()
#admin = User(username='admin', email='admin@example.com')
#guest = User(username='guest', email='guest@example.com')
#db.session.add(admin)
#db.session.add(guest)
#db.session.commit()

@app.route('/')
def user():
	return str(User.query.all())
#	return str(User.query.filter_by(username='admin').first())
