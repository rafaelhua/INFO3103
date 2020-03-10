from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy 
from datetime import datetime

import json
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import *
import cgitb
import cgi
import sys
cgitb.enable()

import settings 

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/rafaelhua/Dropbox/INFO3103/Project/blog.db'

db = SQLAlchemy(app)


# =====================================
# Error handlers
# =====================================
@app.errorhandler(400) 
def not_found(error):
	return make_response(jsonify( { 'status': 'Bad request' } ), 400)

@app.errorhandler(404) 
def not_found(error):
	return make_response(jsonify( { 'status': 'Resource not found' } ), 404)

# =====================================
# class Blogpost
# =====================================
class Blogpost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50))
    subtitle = db.Column(db.String(50))
    author = db.Column(db.String(20))
    date_posted = db.Column(db.DateTime)
    content = db.Column(db.Text)


@app.route('/')
def index():
    posts = Blogpost.query.order_by(Blogpost.date_posted.desc()).all()

    return render_template('index.html', posts=posts)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/post/<int:post_id>')
def post(post_id):
    post = Blogpost.query.filter_by(id=post_id).one()

    return render_template('post.html', post=post)

@app.route('/add')
def add():
    return render_template('add.html')    

@app.route('/addpost', methods=['POST'])
def addpost():    
    title = request.form['title']
    subtitle = request.form['subtitle']
    author = request.form['author']
    content = request.form['content']

    # return '<h1>Title: {} Subtitle: {} Author: {} Content: {}</h1>'.format(title,subtitle,author,content)
    post = Blogpost(title=title, subtitle=subtitle, author=author, content=content, date_posted=datetime.now())

    db.session.add(post)
    db.session.commit()

    return redirect(url_for('index'))


#############################################

if __name__ == '__main__':
    app.run(debug=True)