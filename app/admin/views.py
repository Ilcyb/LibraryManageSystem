from . import admin
from ..utils.decorators import admin_required
from flask import render_template, redirect, url_for

@admin.route('/')
@admin_required
def admin_index():
    return redirect(url_for('admin.manage_book'))

@admin.route('/login')
def admin_login():
    return render_template('adminLogin.html')

@admin.route('/createNewBook')
@admin_required
def create_new_book():
    return render_template('createNewBook.html')

@admin.route('/manageBook')
@admin_required
def manage_book():
    return redirect(url_for('admin.manage_book_page', page=1))

@admin.route('/manageBook/<int:page>')
@admin_required
def manage_book_page(page):
    return render_template('manageBook.html')

@admin.route('/createNewBookCollection')
@admin_required
def create_new_book_collection():
    return render_template('createNewBookCollection.html')

@admin.route('/manageBookCollection/<int:book_id>')
@admin_required
def manage_book_collection(book_id):
    return render_template('manageBookCollection.html')

@admin.route('/createNewAnnouncement')
@admin_required
def create_new_announcement():
    return render_template('createNewAnnouncement.html')

@admin.route('/manageAnnouncement')
@admin_required
def manage_announcement():
    return render_template('manageAnnouncement.html')

@admin.route('/borrow')
@admin_required
def add_borrow_record():
    return render_template('borrow.html')

@admin.route('/return')
@admin_required
def return_book():
    return render_template('returnBook.html')

@admin.route('/lendingHistory')
@admin_required
def lending_history():
    return render_template('lending_history.html')
