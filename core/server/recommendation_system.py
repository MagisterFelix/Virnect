from collections import Counter, namedtuple

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder

from .models import Room
from .serializers import RoomSerializer


class RecommendationSystem:

    def __init__(self, n, rooms):
        self.n = n
        self.rooms = rooms

        self._encoders = {
            "topic": OneHotEncoder(dtype=float),
            "language": OneHotEncoder(dtype=float),
            "tags": CountVectorizer(binary=True, dtype=float)
        }
        self._weights = {
            "topic": 5.0,
            "language": 1.0,
            "tags": 3.0
        }
        self._model = NearestNeighbors(n_neighbors=n)
        self._Point = namedtuple("Point", ["distance", "index"])

        self.train(rooms)

    def _collect_data(self, raw_data):
        data = []

        for row in raw_data:
            data.append({
                "id": row["id"],
                "topic": row["topic"] if isinstance(row["topic"], str) else row["topic"]["title"],
                "language": row["language"],
                "tags": row["tags"] if isinstance(row["tags"], str) else ",".join([tag["name"] for tag in row["tags"]])
            })

        return data

    def _prepare_data(self, data):
        df = pd.DataFrame.from_records(data)

        encoder, weight = self._encoders["topic"], self._weights["topic"]
        try:
            topics = encoder.transform(df[["topic"]]).toarray() * weight
        except ValueError:
            topics = encoder.fit_transform(df[["topic"]]).toarray() * weight

        encoder, weight = self._encoders["language"], self._weights["language"]
        try:
            languages = encoder.transform(df[["language"]]).toarray() * weight
        except ValueError:
            languages = encoder.fit_transform(df[["language"]]).toarray() * weight

        encoder, weight = self._encoders["tags"], self._weights["tags"]
        try:
            tags = encoder.transform(df["tags"]).toarray() * weight
        except ValueError:
            tags = encoder.fit_transform(df["tags"]).toarray() * weight

        df_encoded = pd.concat([
            df.drop(["topic", "language", "tags"], axis=1),
            pd.DataFrame(topics, columns=self._encoders["topic"].get_feature_names_out()),
            pd.DataFrame(languages, columns=self._encoders["language"].get_feature_names_out()),
            pd.DataFrame(tags, columns="tag_" + self._encoders["tags"].get_feature_names_out())
        ], axis=1)

        return df_encoded

    def train(self, rooms):
        if len(rooms) == 0:
            return None

        self.rooms = rooms

        data = self._collect_data(raw_data=rooms)
        df = self._prepare_data(data)

        self._df_rooms = df

        self._model.fit(df.drop(["id"], axis=1))

    def get_recommendations(self, history):
        data = self._collect_data(raw_data=history)
        df = self._prepare_data(data)

        distances, indices = self._model.kneighbors(df.drop(["id"], axis=1), n_neighbors=self.n)
        points = [
            self._Point(distance=row[0][index], index=row[1][index])
            for index in range(self.n)
            for row in zip(distances, indices)
        ]

        most_common_neighbors = [point[0] for point in Counter(points).most_common(n=self.n)]

        recommended = [self._df_rooms.iloc[neighbor.index]["id"] for neighbor in most_common_neighbors]

        recommendations = {
            room["id"]: len(recommended) - recommended.index(room["id"]) if room["id"] in recommended else 0
            for room in self.rooms
        }

        return recommendations


recommendation_system = RecommendationSystem(
    n=3,
    rooms=RoomSerializer(
        instance=Room.objects.all(),
        context={"related": True},
        many=True
    ).data
)
