from . import admin
from flask import render_template, redirect, url_for

@admin.route('/login')
def admin_login():
    return render_template('adminLogin.html')

@admin.route('/createNewBook')
def create_new_book():
    return render_template('createNewBook.html')

@admin.route('/manageBook')
def manage_book():
    return redirect(url_for('admin.manage_book_page', page=1))

@admin.route('/manageBook/<int:page>')
def manage_book_page(page):
    return render_template('manageBook.html')

@admin.route('/createNewBookCollection')
def create_new_book_collection():
    return render_template('createNewBookCollection.html')

@admin.route('/manageBookCollection/<int:book_id>')
def manage_book_collection(book_id):
    return render_template('manageBookCollection.html')

@admin.route('/createNewAnnouncement')
def create_new_announcement():
    return render_template('createNewAnnouncement.html')

@admin.route('/manageAnnouncement')
def manage_announcement():
    return render_template('manageAnnouncement.html')
