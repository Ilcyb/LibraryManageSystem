from . import main
from ..models import Book
from flask import render_template, redirect, url_for
from ..utils.decorators import login_required


@main.route('/')
def index():
    return render_template('index.html')

@main.route('/login')
def login():
    return render_template('login.html')

@main.route('/register')
def register():
    return render_template('register.html')

@main.route('/searchResult')
def search_result():
    return render_template('searchResult.html')

@main.route('/myLibrary')
@login_required
def my_library():
    return render_template('myLibrary.html')

@main.route('/announcement/<int:ann_id>')
def get_announcement(ann_id):
    return render_template('announcement.html')

@main.route('/book/<int:book_id>')
def get_book(book_id):
    Book.query.filter_by(book_id=book_id).first_or_404()
    return render_template('detailBook.html')

@main.route('/book/isbn/<string:isbn>')
def get_book_by_isbn(isbn):
    book = Book.query.filter_by(isbn=isbn).first_or_404()
    return redirect(url_for('main.get_book', book_id=book.book_id))