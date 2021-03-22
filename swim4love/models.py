from swim4love import db


class Swimmer(db.Model):
    '''Model for the swimmers table.'''

    __tablename__ = 'swimmers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    laps = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return '<Swimmer #{:03d} {!r}>'.format(self.id, self.name)


db.create_all() # Create tables using the above configuration
