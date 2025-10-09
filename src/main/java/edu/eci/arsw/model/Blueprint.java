package edu.eci.arsw.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class Blueprint {
    private String author;
    private List<Point> points;
    private String name;

    public Blueprint(String author, String name, Point[] pnts) {
        this.author = author;
        this.name = name;
        this.points = new ArrayList<>(Arrays.asList(pnts));
    }

    public Blueprint(String author, String name) {
        this.author = author;
        this.name = name;
        this.points = new ArrayList<>();
    }

    public Blueprint() {
        this.points = new ArrayList<>();
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public List<Point> getPoints() {
        return points;
    }

    public void setPoints(List<Point> points) {
        this.points = points != null ? points : new ArrayList<>();
    }

    public void addPoint(Point p) {
        if (this.points == null) {
            this.points = new ArrayList<>();
        }
        this.points.add(p);
    }

    @Override
    public String toString() {
        return "Blueprint{author=" + author + ", name=" + name + ", points=" + (points != null ? points.size() : 0) + "}";
    }

    @Override
    public int hashCode() {
        return Objects.hash(author, name, points);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Blueprint other = (Blueprint) obj;
        if (!Objects.equals(this.author, other.author)) {
            return false;
        }
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        if (this.points == null && other.points == null) {
            return true;
        }
        if (this.points == null || other.points == null) {
            return false;
        }
        if (this.points.size() != other.points.size()) {
            return false;
        }
        for (int i = 0; i < this.points.size(); i++) {
            if (!this.points.get(i).equals(other.points.get(i))) {
                return false;
            }
        }
        return true;
    }
}
